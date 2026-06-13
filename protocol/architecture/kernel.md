# SailKernel

`SailKernel` is the single trusted execution contract. It is deployed at the same address on every supported chain (see [addresses](../reference/addresses.md)) and inherits OpenZeppelin's `EIP712` (domain `name = "SailKernel"`, `version = "1"`) and `ReentrancyGuard`. License: GPL-2.0-or-later.

## Responsibilities

1. **Account instantiation** — deploy and/or register a Safe (`createAccount`, `registerAccount`).
2. **Permission registry** — per-account ordered list of `IPermission` addresses with an O(1) index map.
3. **Manager dispatch** — verify the manager's EIP-712 signature, evaluate the named permission, execute via the Safe module path (`dispatch`, `dispatchBatch`).
4. **Fee accounting** — validate manager fee collection against the registered `IFeePolicy` and enforce the protocol/distributor split (`collectFees`).
5. **Principal tracking** — informational cumulative deposit/withdrawal counters (`recordDeposit`, `recordWithdrawal`).

## Per-account state

```solidity
struct AccountConfig {
    address permissionSigner; // authorizes registry operations
    address manager;          // authorizes dispatches
    address feePolicy;        // address(0) = none
    address feeAsset;         // canonical fee settlement token; address(0) = native ETH
    bool    sessionActive;    // false blocks all dispatch
}
mapping(address => AccountConfig) public configs;
mapping(address => bool)          public registered;
```

The permission set lives in a private `address[]` per account plus a `_permissionIndex` map storing *index + 1* (so 0 means "not registered"), enabling O(1) membership and swap-and-pop removal.

## Three nonce namespaces

The kernel maintains **three** independent per-account nonce sequences, so signatures for one operation class can never be replayed as another:

| Nonce | Guards |
| --- | --- |
| `managerNonces` | `dispatch` |
| `batchNonces` | `dispatchBatch` |
| `signerNonces` | every Permission-Signer op: register / revoke / replace / session / fee-policy |

Any **restrictive** signer operation (revoke, replace, revoke-session, manager rotation) additionally bumps `managerNonces` and `batchNonces` by a large epoch increment (`NONCE_EPOCH_INCREMENT = 1 << 128`). This **invalidates every dispatch the manager pre-signed but did not yet submit**, so tightening the mandate cannot be raced by an in-flight dispatch.

## Constants

| Constant | Value | Meaning |
| --- | --- | --- |
| `PERMISSION_GAS_CAP` | `150_000` | gas budget for each `evaluate` staticcall |
| `BATCH_EVAL_GAS_CAP` | `1_000_000` | gas budget for each `evaluateBatch` staticcall |
| `MAX_BATCH_LENGTH` | `16` | max subcalls per batch |
| `NONCE_EPOCH_INCREMENT` | `1 << 128` | epoch bump applied on restrictive ops |

## Selected functions

```solidity
// Account instantiation
function createAccount(
    address safeFactory, address safeSingleton, bytes calldata safeInitializer,
    uint256 saltNonce, address permissionSigner, address manager,
    address feePolicy, address feeAsset
) external returns (address account);
function registerAccount(address permissionSigner, address manager, address feePolicy, address feeAsset) external;
function setManager(address newManager) external; // msg.sender == account; clears mandate

// Permission registry (all permission-signer EIP-712 + deadline)
function registerPermission(address account, address permission, uint256 deadline, bytes calldata sig) external payable;
function registerPermissions(address account, address[] calldata permissions, uint256 deadline, bytes calldata sig) external payable;
function revokePermission(address account, address permission, uint256 deadline, bytes calldata sig) external;
function revokePermissions(address account, address[] calldata permissions, uint256 deadline, bytes calldata sig) external;
function replacePermission(address account, address oldPermission, address newPermission, uint256 deadline, bytes calldata sig) external payable;
function replacePermissions(address account, address[] calldata oldPermissions, address[] calldata newPermissions, uint256 deadline, bytes calldata sig) external payable;
function revokeSession(address account, uint256 deadline, bytes calldata sig) external;
function activateSession(address account, uint256 deadline, bytes calldata sig) external;
function setFeePolicy(address account, address newFeePolicy, address feeAsset, uint256 deadline, bytes calldata sig) external;

// Dispatch
function dispatch(address account, address permission, address target, uint256 value, bytes calldata data, bytes calldata managerSig, uint256 deadline) external;
function dispatchBatch(address account, address permission, Call[] calldata calls, bytes calldata managerSig, uint256 deadline) external;

// Fees & views
function collectFees(address account, uint256 grossFee, uint256 currentNav, address feeToken) external;
function getPermissions(address account) external view returns (address[] memory);
function isPermissionRegistered(address account, address permission) external view returns (bool);
function getPermissionsWithInfo(address account) external view returns (PermissionInfo[] memory);
function previewBatch(address account, address permission, Call[] calldata calls) external view returns (bool approved, string memory reason);
function hashTypedDataV4(bytes32 structHash) external view returns (bytes32);
```

See the [contract reference](../reference/contracts.md) for the full surface and the [EIP-712 reference](../reference/eip712.md) for every type hash.

## Signature verification

Both manager and permission-signer signatures are verified with `_recoverOrERC1271`: ECDSA recovery is tried first (so EIP-7702 accounts that install transient code but don't implement ERC-1271 still work), falling back to ERC-1271 `isValidSignature` when the signer is a contract. Both roles can therefore be EOAs, multisigs, or smart accounts.

## Module-execution boundary

The kernel moves assets only through `ISafe.execTransactionFromModule(target, value, data, 0)` — always operation `0` (CALL), never DELEGATECALL. Two structural guards apply on dispatch:

* **No self-targeting the Safe.** A call whose `target == account` reverts (`AccountSelfTarget`) — this blocks module-triggered `enableModule` / `setGuard` / owner changes that would satisfy the Safe's `onlySelf` guard.
* **No self-targeting the kernel** (batch only) — a subcall targeting the kernel reverts (`KernelSelfTarget`).

Continue to [SailGovernance](governance.md) or the [dispatch internals](dispatch.md).
