# CLI — Mandates

`sailor mandate` manages the permission contracts registered on an SMA. Authoring → simulating → deploying → registering → confirming. See [Build & register a mandate](../guides/build-a-mandate.md) for the narrative flow.

## `mandate deploy`

Deploy a Foundry-compiled permission contract via the browser signing UI.

| Option | Description |
| --- | --- |
| `--artifact <path>` | Path to the Foundry artifact JSON (`out/<Name>.sol/<Name>.json`) |
| `--contract <name>` | Contract name; resolves to `<out>/<name>.sol/<name>.json` |
| `--out <dir>` | Foundry output directory (default `out`) |
| `--name <label>` | Label to track this permission under (defaults to contract name) |
| `--args <json>` | Constructor args as a JSON array (see [the `--args` format](#the-args-format)) |
| `--args-file <path>` | Path to a JSON file containing the constructor-args array (recommended on PowerShell) |
| `--build` | Run `forge build` before deploying |
| `--attach` | After deploy, register the permission on `--sma` |
| `--sma <address>` | SMA to register on (required with `--attach`) |
| `--json` | Machine-readable output |

## `mandate attach`

Register an already-deployed permission on an SMA (EIP-712 `RegisterPermission`).

| Option | Description |
| --- | --- |
| `--address <mandateOrName>` | **Required.** Permission address, or a name tracked locally |
| `--sma <address>` | **Required.** SMA to register the permission on |
| `--label <label>` | Human-readable label shown in the signing UI |
| `--json` | Machine-readable output |

## `mandate deploy-clone`

Deploy + register a standalone clone permission (e.g. `boundedApprove`) via the signing UI.

| Option | Description |
| --- | --- |
| `--template <key>` | **Required.** Standalone clone template key (e.g. `boundedApprove`) |
| `--sma <address>` | **Required.** SMA to deploy the clone for and register it on |
| `--tokens <csv>` | Comma-separated allowed token addresses |
| `--spenders <csv>` | Comma-separated allowed spender addresses |
| `--max <amount>` | Max amount per tx in base units (default: uint256 max) |
| `--label <label>` | Tracking label |
| `--json` | Machine-readable output |

## `mandate simulate`

Probe a permission against sample calls off-chain (`eth_call`, no gas) — prove it accepts the calls you want and rejects the ones you don't, before authorizing on-chain.

| Option | Description |
| --- | --- |
| `--address <permissionOrName>` | **Required.** Permission to probe (address or tracked name) |
| `--sma <address>` | SMA to probe as (`ctx.account`; defaults to `.sail/account.json`) |
| `--target <address>` | Inline single call: target contract address |
| `--calldata <hex>` | Inline single call: 0x-prefixed calldata |
| `--value <wei>` | Inline single call: ETH value in wei (default `0`) |
| `--expect <pass\|fail>` | Inline single call: expected outcome (non-zero exit on mismatch) |
| `--label <text>` | Inline single call: human-readable label |
| `--calls <file>` | Batch: JSON array of `{ target, calldata, value?, expect?, label? }` |
| `--json` | Machine-readable output |

See [Simulate before going live](../guides/simulate.md).

## `mandate revoke`

Revoke permission(s) from an SMA (EIP-712 `RevokePermissions`, owner-authorized).

| Option | Description |
| --- | --- |
| `--address <permissionOrName>` | Permission address, or a name tracked locally |
| `--sma <address>` | **Required.** Safe (SMA) to revoke the permission(s) from |
| `--all` | Revoke every permission currently registered on the SMA |
| `--json` | Machine-readable output |

## `mandate prepare` · `mandate sign`

| Command | Options | Description |
| --- | --- | --- |
| `mandate prepare` | — | Prepare a mandate draft for review and signing in the UI (MetaMask) |
| `mandate sign` | `--yes` | Review and confirm the permissions authorized for your SMA (`--yes` skips the prompt for CI). Reconciles against the live on-chain `getPermissions()` before building the payload. |

## `mandate templates` · `mandate update` · `mandate list`

| Command | Options | Description |
| --- | --- | --- |
| `mandate templates` | `--json` | Show how to author your own permission contract (and any community-deployed addresses) |
| `mandate update` | `--address <…>` (required), `--name <label>`, `--source-path <path>`, `--artifact-path <path>`, `--json` | Update tracking metadata for a permission (rename, source path, artifact path) |
| `mandate list` | — | List permission contracts deployed from this project |

## The `--args` format

`--args` (on `mandate deploy`) takes the permission's **constructor arguments as a JSON array**. Each element is a string or a nested array, matching the Solidity constructor signature in order. The only subtlety is **shell quoting**:

```bash
# bash / zsh / macOS — single-quote the whole JSON array:
sailor mandate deploy --contract MyPermission --attach --sma 0xYourSMA \
  --args '["0xPermissionSigner", ["0xTargetA","0xTargetB"], "1000000"]'
```

```powershell
# PowerShell — inline JSON quoting is brittle. Escape the inner quotes:
sailor mandate deploy --contract MyPermission --attach --sma 0xYourSMA `
  --args '[\"0xPermissionSigner\", [\"0xTargetA\"], \"1000000\"]'
```

{% hint style="info" %}
**On PowerShell, prefer `--args-file`.** Put the array in a JSON file and pass its path — this avoids the inline-quoting pitfalls entirely:
{% endhint %}

```json
// args.json
["0xPermissionSigner", ["0xTargetA", "0xTargetB"], "1000000"]
```

```bash
sailor mandate deploy --contract MyPermission --attach --sma 0xYourSMA --args-file ./args.json
```

Rules of thumb: numbers and addresses are both written as **strings** in the array; arrays of addresses are **nested arrays**; the element order must match the constructor's parameter order exactly. When in doubt, use `--args-file`.
