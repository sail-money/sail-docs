# MandateFactory

`MandateFactory` is a UX orchestrator. It bundles the two steps of attaching a configurable permission — `template.configure(...)` then `kernel.registerPermission(...)` — into a single transaction, and forwards the registration fee with an automatic refund of any excess. License: GPL-2.0-or-later.

## It holds no trust

The factory has **no privilege**. Every inner call is independently signature-authenticated:

* `configure` carries an EIP-712 signature from the account's Permission Signer (verified by the template against the kernel).
* `registerPermission` carries an EIP-712 signature from the Permission Signer (verified by the kernel).

So the factory's only value is **bundling, fee forwarding, and a canonical entry point** for tooling. Anyone can deploy a template implementing `IConfigurablePermission` and use it with the factory immediately — no allowlist, no registry. Its `receive()` accepts ETH **only from the kernel** (the fee refund), preventing balance-inflation games against the refund accounting.

## Operations

| Function | What it does |
| --- | --- |
| `attach` | `configure` one template, then `registerPermission`, one tx; refunds fee excess. |
| `attachBatch` | `configure` N templates, then `registerPermissions` atomically. |
| `reconfigure` | re-`configure` a template's params for an account (no kernel touch). |
| `replace` | `configure` a new template, then `replacePermission` (atomic kernel swap). |
| `deployAndAttach` | clone a standalone template (EIP-1167), initialize it, then `registerPermission` — one tx. |
| `detach` / `detachBatch` | `revokePermission(s)` for an account. |

## Deterministic clones

`deployAndAttach` deploys an EIP-1167 minimal-proxy clone of a logic contract via `Clones.cloneDeterministic`, with the salt **namespaced by `msg.sender`** (`keccak256(abi.encode(msg.sender, salt))`) to prevent cross-caller salt squatting. Predict the address beforehand with `predictCloneAddress(impl, salt)` — **from the same EOA** that will send `deployAndAttach`, because of the namespacing. After init, a liveness check (`CloneInitializable.initialized()`) guards against a clone that failed to initialize.

## Events

`Attached`, `BatchAttached`, `Reconfigured`, `Replaced`, `Detached`, `BatchDetached`, and `CloneDeployedAndAttached(account, impl, clone, salt)`.

{% hint style="info" %}
Using the factory is optional. You can always call the kernel's `registerPermission` / `replacePermission` / `revokePermission` directly — the factory just saves a transaction when a template also needs configuring.
{% endhint %}
