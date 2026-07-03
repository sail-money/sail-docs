# Build & register a mandate

A mandate is the set of [permissions](../../protocol/permissions/) registered on your SMA. With Sailor you author them in a Foundry workspace, prove them off-chain, then register them — every authorizing signature comes from the owner / permission signer in the browser.

## 1. Author a permission

The scaffold includes a Foundry workspace with `@sail/interfaces/IPermission.sol` vendored under `.sail/contracts/`. Write a contract implementing [`IPermission`](../../protocol/permissions/ipermission.md) that encodes your bounds (tokens, amounts, venues, recipients), then build:

```bash
forge build
```

See the Protocol's [Write your first permission](../../protocol/guides/write-a-permission.md) for the contract pattern, and [Configure a shared template](configure-a-template.md) to use an example instead of writing from scratch.

## 2. Simulate before authorizing

Never register a permission you haven't proven. Probe it off-chain (no gas):

```bash
sailor mandate simulate --address MyPermission --sma 0xYourSMA \
  --target 0xRouter --calldata 0x... --expect pass
```

This `eth_call`s the permission's `evaluate` with a constructed `Context` and reports PASS / FAIL / REVERT. See [Simulate before going live](simulate.md) for the batch (`--calls`) form and the full option set.

## 3. Deploy and register

```bash
# deploy a compiled permission and register it in one flow (owner signs in the browser):
sailor mandate deploy --contract MyPermission --attach --sma 0xYourSMA \
  --args '["0xPermissionSigner", ["0xTarget"]]'

# or register an already-deployed permission:
sailor mandate attach --address 0xPermission --sma 0xYourSMA
```

`deploy` emits a contract-creation signing request (the owner signs it), reads the deployed address from the receipt, and tracks it in `.sail/state/mandates.json`. `attach` reads the signer nonce, has the owner sign a `RegisterPermission` EIP-712 message, then submits `kernel.registerPermission` with the exact registration fee. Both take `--json` for headless use.

{% hint style="info" %}
**The `--args` format.** Constructor args are a JSON array passed to `--args`. Quoting differs by shell — on PowerShell, use `--args-file` instead of inline JSON. See [CLI → Mandate lifecycle](../cli/#mandate-lifecycle) for the exact rules and examples.
{% endhint %}

## 4. Confirm and sign the mandate

```bash
sailor mandate prepare      # prepare a mandate draft for review/signing in the UI
sailor mandate sign         # review and confirm the permissions authorized for your SMA (--yes to skip the prompt)
```

`sign` reconciles against the live on-chain `getPermissions()` before building the payload — permissions revoked on-chain are excluded even if they remain in the local append-only `.sail/state/mandates.json`. The signed result lands in `.sail/mandate.json`, which the runner executes against.

## Critical: ERC-20 approvals need explicit coverage

An ERC-20 `approve()` is **not** covered by a swap, supply, or deposit permission — it is a distinct call and needs its own authorization. There are two non-mixable models:

* **Per-call (default):** separate single dispatches, each gated by its own `IPermission` — one for the `approve`, one for the action.
* **Atomic batch:** one [`IBatchPermission`](../../protocol/architecture/dispatch.md) authorizing the whole `[approve, action, reset]` sequence as a unit. A normal `IPermission` cannot authorize a batch.

Choose deliberately; a swap permission alone will not let your agent approve the router.

## Changing the mandate later

```bash
sailor mandate revoke --address 0xPermission --sma 0xYourSMA   # or --all
sailor mandate update --address MyName --name NewName          # tracking metadata only
sailor mandate list                                            # permissions deployed from this project
```

Revocation is owner-authorized (`RevokePermissions`) and takes effect in a single block, invalidating the manager's outstanding pre-signed dispatches. See the Protocol's [permission lifecycle](../../protocol/permissions/lifecycle.md).
