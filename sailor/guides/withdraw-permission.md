# WithdrawPermission (v2)

`WithdrawPermission` gates bounded **position exits** — ERC-4626 vault withdraw/redeem and Aave v2/v3 pool withdraw — with proceeds paid **only to the account itself**. It is one of the [seven shared templates](configure-a-template.md): register it, then configure your bounds.

It was **rewritten in place**: it previously gated ERC-20 transfers to a single recipient; it now gates vault/pool exits. Same name and slot in the seven-template set, a **different address**, and an incompatible config. (Introspection identity `sail.permission.WithdrawPermission.v2`; `permissionVersion` `keccak256("v2")`. Note its `discriminator()` is unchanged from v1 and cannot tell the versions apart — resolve by `permissionId`/`permissionVersion`, not by `discriminator`.)

To move ERC-20 tokens the SMA already holds **out** to a fixed recipient, use [`TransferPermission`](configure-a-template.md#withdrawpermission-vs-transferpermission-which-one) instead. An exit and a payout are two permissions, not one.

## Config blob

`abi.encode(address[] targets, address[] tokens, uint256 maxAmountPerTx)`:

* `targets` — allowlisted vaults / pools the account may exit from (non-empty, ≤ 50, no zero addresses).
* `tokens` — underlying-asset allowlist. It is consulted **only on the Aave path** (where the asset appears in calldata); on the ERC-4626 paths it has **no effect**. It must still be **non-empty** even for a vault-only config — an empty array reverts at configure time (`EmptyAllowlist`).
* `maxAmountPerTx` — the per-transaction cap. **What it bounds depends on the selector** (see below); `0` is accepted and blocks every non-zero exit (fail-closed).

## The three gated selectors

Any other selector denies:

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

## Encoding the config

Round-trips with Sailor's decoder:

```bash
cast abi-encode "f(address[],address[],uint256)" "[<vault1>,<vault2>]" "[<asset>]" <cap>
```

{% hint style="info" %}
**Review status.** WithdrawPermission v2 was written **after** the June 2026 Octane external review and is **not covered by it** — its own on-chain NatSpec states "It has not been externally reviewed." Its internal coverage is **80 tests across three suites** — 44 unit, 18 adversarial stress, and 18 independent red-team — all passing. Treat it, like every template, as a reference implementation to verify and test before production use.
{% endhint %}
