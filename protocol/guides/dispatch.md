# Dispatch a transaction within bounds

With the SMA registered and at least one permission attached, the manager can execute calls. Each dispatch names the one permission that should authorize it.

## 1. Build the Dispatch signature

The selective-model type string (note the `permission` field):

```
Dispatch(address account,address permission,address target,uint256 value,bytes32 dataHash,uint256 nonce,uint256 deadline)
```

Sign with the **manager** key:

```
dataHash  = keccak256(data)                  // the call's calldata
structHash = keccak256(abi.encode(
    DISPATCH_TYPEHASH,
    account, permission, target, value, dataHash,
    managerNonces[account],                   // read from the kernel
    deadline
))
digest    = kernel.hashTypedDataV4(structHash)
managerSig = sign(digest, managerKey)         // ECDSA or ERC-1271
```

Read the nonce from `kernel.managerNonces(account)`.

## 2. Submit

```solidity
kernel.dispatch(account, permission, target, value, data, managerSig, deadline);
```

The kernel verifies the signature, staticcalls `permission.evaluate(data, ctx)` under the 150k gas cap, and — only if it returns `true` — executes `execTransactionFromModule(target, value, data, 0)` on the Safe. On success it emits `Dispatched(account, permission, target, selector, value)`.

## What a denial looks like

The dispatch **reverts** (no state change) in these cases:

| Revert | Cause |
| --- | --- |
| `PermissionNotRegistered(permission)` | you named a permission that isn't on the account's mandate |
| `PermissionDenied(permission)` | the permission returned false, reverted, ran out of gas, or returned malformed data |
| `SessionInactive(account)` | the session is paused (`revokeSession` was called) |
| `DeadlineExpired(deadline, now)` | `block.timestamp > deadline` |
| `InvalidManagerSignature()` | the signature didn't recover to the account's `manager` |
| `AccountSelfTarget()` | `target == account` (blocked — would let the Safe reconfigure itself) |
| `SafeExecutionFailed()` | the permission approved it but the Safe call itself failed |
| `ProtocolPaused()` | the protocol is paused |

Because evaluation is fail-closed, a buggy permission denies rather than over-permits. If you hit `PermissionDenied`, re-check the permission's bounds against your call — it's doing its job.

## Nonces and in-flight invalidation

Each successful dispatch increments `managerNonces[account]`. If the Permission Signer revokes a permission, revokes the session, replaces a permission, or the Safe rotates the manager, the kernel bumps the manager-nonce **epoch** (`1 << 128`), which invalidates **every dispatch the manager had pre-signed but not yet submitted**. This means tightening the mandate cannot be raced by a stale signature.

## Batches

For an atomic multi-call sequence (e.g. `approve → call → reset`), use `dispatchBatch` with a batch-aware permission. The signature is over `DispatchBatch(account, permission, callsHash, nonce, deadline)` with `callsHash = keccak256(abi.encode(calls))`, using the separate `batchNonces`. You can pre-check a batch off-chain with `previewBatch(account, permission, calls)`. See [single & batch dispatch](../architecture/dispatch.md).
