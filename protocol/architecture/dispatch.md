# Single & batch dispatch

The kernel exposes two execution paths. Both use **selective authorization** — the manager names one registered permission, and only that permission is evaluated.

## Single dispatch

```solidity
function dispatch(
    address account, address permission, address target,
    uint256 value, bytes calldata data,
    bytes calldata managerSig, uint256 deadline
) external nonReentrant whenNotPaused;
```

Order of operations:

1. `account` must be registered and its `sessionActive` true; `block.timestamp <= deadline`.
2. The named `permission` must be registered (O(1) check) — else `PermissionNotRegistered`.
3. Recover the manager's EIP-712 signature over the `Dispatch` struct at `managerNonces[account]`; on success, increment the nonce.
4. Reject `target == account` (`AccountSelfTarget`).
5. Build the read-only `Context` and `staticcall` `permission.evaluate(data, ctx)` under `PERMISSION_GAS_CAP` (150k). Anything other than a clean `true` (decoded as `uint256 == 1`) → `PermissionDenied`.
6. `ISafe(account).execTransactionFromModule(target, value, data, 0)`. A `false` return → `SafeExecutionFailed`.
7. Emit `Dispatched(account, permission, target, selector, value)`.

The `Context` the permission receives:

```solidity
struct Context {
    address account;        // the Safe whose assets move
    address manager;        // the signer of this dispatch
    address submitter;      // msg.sender (may be a relayer)
    address target;         // call target
    bytes4  selector;       // first 4 bytes of data; bytes4(0) if < 4 bytes
    uint256 value;          // wei forwarded
    uint256 blockTimestamp;
    uint256 blockNumber;
}
```

## Batch dispatch

```solidity
function dispatchBatch(
    address account, address permission, Call[] calldata calls,
    bytes calldata managerSig, uint256 deadline
) external nonReentrant whenNotPaused;

struct Call { address target; uint256 value; bytes data; }
```

A batch executes an ordered array of `Call`s **atomically**, gated by **one** batch-aware permission implementing `IBatchPermission`. Key differences from single dispatch:

* The signature is over `DispatchBatch(account, permission, callsHash, nonce, deadline)` where `callsHash = keccak256(abi.encode(calls))`, using the separate `batchNonces` namespace.
* Length is bounded: `1 … MAX_BATCH_LENGTH` (16) — else `EmptyBatch` / `BatchTooLong`.
* The kernel confirms the permission is batch-aware via a **staticcall** to `isBatchPermission()` (stricter than try/catch — it guarantees no state mutation regardless of declared modifiers); failure → `PermissionNotBatchAware`.
* Pre-flight: no subcall may target the zero address (`BatchZeroTarget`), the kernel (`KernelSelfTarget`), or the Safe itself (`AccountSelfTarget`).
* The permission's `evaluateBatch(calls, ctx)` is staticcalled under `BATCH_EVAL_GAS_CAP` (1,000,000). Denial → `BatchPermissionDenied`.
* Each subcall runs via `execTransactionFromModule(..., 0)` in order; any `false` return reverts the whole batch (`BatchSubcallFailed(index, target)`), rolling back earlier subcalls.

A read-only `previewBatch(account, permission, calls)` runs the same validation **except** signature/session/deadline and returns `(approved, reason)` for off-chain pre-flight.

## The approve → call → reset pattern

The motivating use case for batch dispatch is a temporary ERC-20 approval that no single-call permission can safely express. A batch-aware permission validates the exact 3-call shape as a unit:

```
[0] approve(spender, amount)   on an allowlisted token   (amount ≤ cap)
[1] <consuming call>           on an allowlisted (target, selector)
[2] approve(spender, 0)        same token & spender, reset to zero
```

The approve and the reset are individually unsafe; the *pair bracketing a bounded consuming call* is safe. The reference implementation is `SharedApproveAndCallBatchPermission`, which additionally can require that the consuming call's leading `uint256` argument equals the approved amount. Because the allowance exists only for the lifetime of the atomic batch and is reset before the transaction completes, there is no window in which it can be exploited.

See [shared templates](../permissions/shared-templates.md) and the [dispatch guide](../guides/dispatch.md).
