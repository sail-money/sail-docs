# Configure a shared template

Sailor can register a [shared template](../../protocol/permissions/shared-templates.md) — a permission deployed once and configured per account — instead of authoring a permission from scratch.

{% hint style="info" %}
**Templates are examples, not the protocol.** The shipped `Shared*` templates and the standalone clone templates are reference implementations that demonstrate the [`IPermission`](../../protocol/permissions/ipermission.md) pattern. They are illustrative, not a fixed part of the trusted core — anyone can deploy their own. You are responsible for the correctness of any permission you register (see [permission correctness is the author's responsibility](../../protocol/security/limitations.md)). Treat them as starting points to read, adapt, and **verify and test before any production use** — not audited, drop-in contracts.
{% endhint %}

## The seven shared templates

Sail Protocol's **seven shared permission templates are deployed today** — multi-tenant singletons at the **same CREATE2 address on all 12 supported chains**, registered as `knownTemplates` in the SDK deployment registry. You don't deploy them; you **register** one on your SMA and **configure** your own bounds:

| Template | Bounds |
| --- | --- |
| `SwapPermission` | DEX swaps: router + token allowlists, per-tx cap, mandatory oracle slippage band |
| `SwapPermissionNoOracle` | Swaps for tokens without an oracle: allowlists + cap + live-pool sanity band |
| `BorrowPermission` | Borrowing: protocol + asset allowlist, cap, on-chain LTV check |
| `DepositPermission` | Deposits into ERC-4626 vaults / Aave: target + token bounds, cap |
| `WithdrawPermission` | Bounded **position exits** — ERC-4626 vault withdraw/redeem and Aave v2/v3 pool withdraw — with proceeds paid **only to the account itself** (target allowlist + per-tx cap) |
| `TransferPermission` | Moves ERC-20 tokens the SMA already holds **out** to a pinned recipient: token + recipient allowlists, per-transfer caps |
| `ApproveAndCallBatchPermission` | Atomic approve → call → reset-to-zero batches |

See what's live on your chain:

```bash
sailor mandate templates           # deployed template addresses + how to author your own
sailor capabilities                # chains, kernel model, mandate templates, strategy primitives (read-only)
```

Their addresses are in the [Protocol → Deployment addresses](../../protocol/reference/addresses.md), and each template has a dedicated [skill](../skills.md) that carries its exact parameter schema and the safe order of operations.

## Register, then configure

`sailor mandate register` only **registers** a template — you must also **configure** the per-account bounds:

```bash
# 1. Register (owner signs an EIP-712 RegisterPermission in the browser):
sailor mandate register --address <templateAddress> --sma <yourSMA>

# 2. Configure your bounds (tokens, caps, venues) for that template:
sailor mandate configure --address <templateAddress> \
  --template SwapPermission --args-file swap-config.json
```

The `sailor-template-*` skills drive this conversationally with the correct schema per template. `--simulate-only` on `configure` gives a gas-free preflight.

{% hint style="info" %}
**`sailor mandate deploy-clone` is currently unavailable** — no clone templates are deployed. For a single-account, bespoke permission, author your own `IPermission` and use `sailor mandate deploy --contract <Name> --attach` (see [Build & register a mandate](build-a-mandate.md)).
{% endhint %}

## Always simulate first

Prove the configured template accepts and rejects the right calls before authorizing:

```bash
sailor mandate simulate --address <templateAddress> --sma <yourSMA> --calls ./samples.json
```

See [Simulate before going live](simulate.md). Then register/confirm exactly as in [Build & register a mandate](build-a-mandate.md).

## WithdrawPermission vs TransferPermission — which one?

These two are easy to confuse; they do opposite things:

* **`WithdrawPermission` exits a position** — it redeems from an ERC-4626 vault or an Aave v2/v3 pool, and the proceeds land **in the SMA itself**. It cannot send funds to any other address.
* **`TransferPermission` moves tokens out** — it sends ERC-20 tokens the SMA already holds to a **pinned external recipient**.

So: *"exit this vault position"* → `WithdrawPermission`. *"get my money out of the SMA"* / *"send held tokens to my wallet"* → `TransferPermission` (with a one-entry recipient allowlist). An exit and a payout are two permissions, not one.

## WithdrawPermission (v2) — bounded position exits

`WithdrawPermission` was **rewritten in place** — it previously gated ERC-20 transfers to a single recipient; it now gates bounded exits from vaults and lending pools, paid only to the account. Same name and slot in the seven-template set, a **different address**, and an incompatible config. (Introspection identity `sail.permission.WithdrawPermission.v2`; `permissionVersion` `keccak256("v2")`. Note its `discriminator()` is unchanged from v1 and cannot tell the versions apart — resolve by `permissionId`/`permissionVersion`, not by `discriminator`.)

**Config blob** — `abi.encode(address[] targets, address[] tokens, uint256 maxAmountPerTx)`:

* `targets` — allowlisted vaults / pools the account may exit from (non-empty, ≤ 50, no zero addresses).
* `tokens` — underlying-asset allowlist. It is consulted **only on the Aave path** (where the asset appears in calldata); on the ERC-4626 paths it has **no effect**. It must still be **non-empty** even for a vault-only config — an empty array reverts at configure time (`EmptyAllowlist`).
* `maxAmountPerTx` — the per-transaction cap. **What it bounds depends on the selector** (see below); `0` is accepted and blocks every non-zero exit (fail-closed).

**Exactly three gated selectors** (any other selector denies):

| Selector | Function | Venue | Cap bounds | Recipient / owner pin |
| --- | --- | --- | --- | --- |
| `0xb460af94` | `withdraw(uint256 assets, address receiver, address owner)` | ERC-4626 | **assets** | `receiver` **and** `owner` must both equal the account |
| `0xba087652` | `redeem(uint256 shares, address receiver, address owner)` | ERC-4626 | **shares** (not assets — see note) | `receiver` **and** `owner` must both equal the account |
| `0x69328dec` | `withdraw(address asset, uint256 amount, address to)` | Aave v2 LendingPool / v3 Pool | **assets** | `to` must equal the account; `asset` must be in `tokens` |

On every path: the call target must be in `targets`; any non-zero native value is rejected; an unconfigured account denies. **Net guarantee:** proceeds can only ever be paid to the account itself, and shares can only ever be burned from the account's own position.

{% hint style="warning" %}
**The `redeem` cap is denominated in shares, not assets.** `withdraw` (ERC-4626) and the Aave path cap the asset amount directly; `redeem` caps the **share** count, whose underlying value floats with the share price (these templates are oracle-free). If you need a fixed *value* ceiling per exit, cap on the `withdraw` path.
{% endhint %}

Other constraints worth knowing: the cap is **per-transaction, not cumulative** (a manager may make many at-cap exits); the permission signer can reconfigure `targets`/`tokens`/`cap` at any time with a fresh nonce; and the template does not judge whether an allowlisted venue is solvent or honest — allowlist only venues you trust to implement standard ERC-4626 / Aave semantics. **Compound v2/v3 and Aave v4 are deliberately unsupported** — their exit functions pay `msg.sender` with no recipient in calldata, so the account-only guarantee cannot be enforced by calldata inspection.

**Encoding the config** (round-trips with Sailor's decoder):

```bash
cast abi-encode "f(address[],address[],uint256)" "[<vault1>,<vault2>]" "[<asset>]" <cap>
```

{% hint style="info" %}
**Review status.** WithdrawPermission v2 was written **after** the June 2026 Octane external review and is **not covered by it** — its own on-chain NatSpec states "It has not been externally reviewed." Its internal coverage is **80 tests across three suites** — 44 unit, 18 adversarial stress, and 18 independent red-team — all passing. Treat it, like every template, as a reference implementation to verify and test before production use.
{% endhint %}
