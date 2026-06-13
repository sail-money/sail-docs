# Configure a shared template

Sailor can register a [shared template](../../protocol/permissions/shared-templates.md) — a permission deployed once and configured per account — instead of authoring a permission from scratch.

{% hint style="info" %}
**Templates are examples, not the protocol.** The shipped `Shared*` templates and the standalone clone templates are reference implementations that demonstrate the [`IPermission`](../../protocol/permissions/ipermission.md) pattern. They are illustrative, not a fixed part of the trusted core — anyone can deploy their own. You are responsible for the correctness of any permission you register (see [permission correctness is the author's responsibility](../../protocol/security/limitations.md)). Treat them as starting points to read, adapt, and **verify and test before any production use** — not audited, drop-in contracts.
{% endhint %}

## See what's available

```bash
sailor mandate templates           # how to author your own, plus any community-deployed addresses
sailor capabilities                # chains, kernel model, mandate templates, strategy primitives (read-only)
```

As of this writing, permission templates are **not yet deployed against the current kernel** on any chain, so `mandate templates` focuses on how to author and deploy your own. When templates are published, their addresses appear here.

## Standalone clone templates

Some templates are single-account and are deployed as an EIP-1167 clone, initialized, and registered in one flow:

```bash
sailor mandate deploy-clone --template boundedApprove --sma 0xYourSMA \
  --tokens 0xUSDC,0xWETH \
  --spenders 0xRouter \
  --max 500000000 \
  --label "approve-usdc-weth"
#   --template <key>   required (e.g. boundedApprove)
#   --sma <address>    required
#   --tokens <csv>     comma-separated allowed token addresses
#   --spenders <csv>   comma-separated allowed spender addresses
#   --max <amount>     max amount per tx in base units (default: uint256 max)
#   --label <label>    tracking label
#   --json
```

This deploys a dedicated clone for your account (deterministic address, namespaced by the deployer), wires its init params from the flags, and registers it on the SMA via the signing UI.

## Always simulate first

Whether you configure a shared template or deploy a clone, prove it accepts and rejects the right calls before authorizing:

```bash
sailor mandate simulate --address 0xClone --sma 0xYourSMA --calls ./samples.json
```

See [Simulate before going live](simulate.md). Then register/confirm exactly as in [Build & register a mandate](build-a-mandate.md).
