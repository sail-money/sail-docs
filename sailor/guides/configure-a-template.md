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
| `WithdrawPermission` | Withdrawals to one fixed recipient (the SMA / owner Safe) |
| `TransferPermission` | ERC-20 transfers: token + recipient allowlists, per-transfer caps |
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
