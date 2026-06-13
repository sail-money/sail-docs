# The mandate & selective dispatch

## The mandate is a set of contracts, not a document

In Sail, the **mandate** is the set of permissions registered for an SMA — contracts implementing `IPermission` that define what the manager is authorized to do. The Safe is the account the mandate applies to; it is not itself part of the mandate.

The kernel stores, per account, an ordered list of permission addresses plus an index map for O(1) membership checks. Adding to the mandate is `registerPermission` (or `registerPermissions` for several at once); removing is `revokePermission` / `revokePermissions`; swapping atomically is `replacePermission` / `replacePermissions`. Each of these is authorized by an EIP-712 signature from the **Permission Signer**.

## Selective dispatch: one named permission authorizes each call

When the manager submits a transaction, its signature **names one** registered permission as the authorizer for that dispatch:

```solidity
function dispatch(
    address account,
    address permission,   // the single permission that must approve this call
    address target,
    uint256 value,
    bytes calldata data,
    bytes calldata managerSig,
    uint256 deadline
) external;
```

The kernel calls `evaluate()` on **that permission alone** — no other registered permission is consulted — and dispatches the call to the Safe only if it returns `true`.

This is **selective authorization**. It replaced an earlier conjunctive (AND-of-all) model, and the difference matters: with selective dispatch, unrelated permissions can coexist on one account without falsely denying each other. A swap permission, a borrow permission, and a transfer permission can all be registered; each call names the one that should authorize it, and the others stay out of the way.

{% hint style="info" %}
**Mandate = union; dispatch = selection.** The mandate is the *union* of all registered permissions. Each dispatch *selects* one of them as its authorizer. Layered "must satisfy several permissions at once" composition is not provided by the kernel — express compound rules inside a single permission (or a batch permission) instead.
{% endhint %}

## What happens on a denied call

If the manager names a permission that is not registered, the kernel reverts with `PermissionNotRegistered` before any evaluation. If the named permission returns `false`, reverts, runs out of gas, or returns malformed data, the kernel reverts the whole dispatch with `PermissionDenied`. Either way, **no state change occurs** — the call never reaches the Safe.

## Batches

For multi-step strategies that must execute atomically (the classic case being an `approve → call → reset` sequence), the kernel exposes `dispatchBatch`, gated by a single **batch-aware** permission implementing `IBatchPermission`. The same selective model applies: one named permission validates the entire call sequence. See [single & batch dispatch](../architecture/dispatch.md).

Next: the [four guarantees](evaluation-guarantees.md) that protect the kernel from whatever a permission does.
