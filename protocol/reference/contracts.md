# Contract reference

The public surface of the trusted core, function by function. Signatures are mirrored from the deployed source; see the [Protocol repository](https://github.com/sail-money/Protocol) for full NatSpec.

## SailKernel

`EIP712("SailKernel","1")`, `ReentrancyGuard`. GPL-2.0-or-later.

### Account instantiation

| Function | Notes |
| --- | --- |
| `createAccount(address safeFactory, address safeSingleton, bytes safeInitializer, uint256 saltNonce, address permissionSigner, address manager, address feePolicy, address feeAsset) → address` | Deploy (or adopt) a Safe via a trusted factory and register it. |
| `registerAccount(address permissionSigner, address manager, address feePolicy, address feeAsset)` | Register an existing Safe. `msg.sender` must be the Safe (codehash + module checks). |
| `setManager(address newManager)` | Rotate the manager. `msg.sender` must be the Safe. Clears the mandate; bumps nonce epochs. |
| `getManager(address account) → address` | Current manager. |

### Permission registry (permission-signer EIP-712 + deadline)

| Function | Notes |
| --- | --- |
| `registerPermission(address account, address permission, uint256 deadline, bytes sig) payable` | Add one; charges the fee. |
| `registerPermissions(address account, address[] permissions, uint256 deadline, bytes sig) payable` | Add many under one nonce. |
| `revokePermission(address account, address permission, uint256 deadline, bytes sig)` | Remove one. Allowed while paused. |
| `revokePermissions(address account, address[] permissions, uint256 deadline, bytes sig)` | Remove many. |
| `replacePermission(address account, address oldPermission, address newPermission, uint256 deadline, bytes sig) payable` | Atomic swap. |
| `replacePermissions(address account, address[] oldPermissions, address[] newPermissions, uint256 deadline, bytes sig) payable` | Atomic N→N swap. |
| `revokeSession(address account, uint256 deadline, bytes sig)` | Suspend dispatch. |
| `activateSession(address account, uint256 deadline, bytes sig)` | Resume dispatch. |
| `setFeePolicy(address account, address newFeePolicy, address feeAsset, uint256 deadline, bytes sig)` | Change/clear the policy. |
| `getPermissions(address account) → address[]` · `isPermissionRegistered(address,address) → bool` · `getPermissionsWithInfo(address) → PermissionInfo[]` | Views. |

### Dispatch & fees

| Function | Notes |
| --- | --- |
| `dispatch(address account, address permission, address target, uint256 value, bytes data, bytes managerSig, uint256 deadline)` | Single call, selective auth. |
| `dispatchBatch(address account, address permission, Call[] calls, bytes managerSig, uint256 deadline)` | Atomic batch via a batch-aware permission. |
| `previewBatch(address account, address permission, Call[] calls) → (bool, string)` | Off-chain pre-flight (no sig/session/deadline check). |
| `collectFees(address account, uint256 grossFee, uint256 currentNav, address feeToken)` | Manager / Safe / permissionSigner may call; enforces the policy ceiling + protocol split. |
| `recordDeposit(address account, uint256 amount)` · `recordWithdrawal(address account, uint256 amount)` | Informational; permissionSigner only. |
| `setTreasury(address newTreasury)` | `onlyTimelock`. |
| `hashTypedDataV4(bytes32 structHash) → bytes32` | EIP-712 digest helper. |

Key public constants: `PERMISSION_GAS_CAP = 150_000`, `BATCH_EVAL_GAS_CAP = 1_000_000`, `MAX_BATCH_LENGTH = 16`, plus the `*_TYPEHASH` constants ([EIP-712 reference](eip712.md)). Public mappings: `configs`, `registered`, `managerNonces`, `batchNonces`, `signerNonces`, `cumulativeDeposits`, `cumulativeWithdrawals`, `treasury`, `governance`.

## SailGovernance

GPL-2.0-or-later. Immutable caps: `MAX_PROTOCOL_CUT_BPS = 2500`, `MAX_PERMISSIONS_CAP = 100`, `MAX_PERMISSION_FEE_WEI` (≤ 0.01 native), `REQUIRED_TIMELOCK_DELAY = 48 hours`, `PAUSE_COOLDOWN = 72 hours`.

| Function | Notes |
| --- | --- |
| `setProtocolCutBps(uint256)` · `setPermissionRegistrationFee(uint256)` · `setMaxPermissionsPerAccount(uint256)` | `onlyTimelock`, bounded by caps. |
| `setTrustedSafeFactory / setTrustedSafeSingleton / setTrustedFeePolicy / setTrustedModuleSetup(address,bool)` · `setTrustedSafeProxyCodehash(bytes32,bool)` | `onlyTimelock`. |
| `bootstrapAllowlists(address[],address[],address[],address[],bytes32[])` | `onlyGovernance`, once, pre-timelock; latches `allowlistBootstrapped`. |
| `proposeGovernance(address)` · `acceptGovernance()` · `rotateTimelockRoles(address oldGov, address newGov)` | Two-step transfer + role rotation. |
| `pause()` · `unpause()` (emergency admin) · `rotateEmergencyAdmin(address)` (timelock) · `isPaused() → bool` | 72h auto-expiry pause. |

Public state: `currentProtocolCutBps`, `permissionRegistrationFee`, `maxPermissionsPerAccount`, `governance`, `pendingGovernance`, `emergencyAdmin`, `timelock`, `pauseExpiry`, the `trusted*` mappings, `allowlistBootstrapped`.

## StandardFeePolicy

`IFeePolicy`. GPL-2.0-or-later. Caps: management ≤ 1000 bps, performance ≤ 5000 bps, distributor ≤ 10000 bps; `MIN_COLLECTION_INTERVAL = 1 days`.

| Function | Notes |
| --- | --- |
| `feeRecipient() → address` | Returns the `feeManager`. |
| `computeFee(address account, uint256 currentNav) → (uint256 grossFee, address distributor, uint256 distributorBps)` | Management + performance over HWM. |
| `recordCollection(address account, uint256 grossFee, uint256 currentNav)` | `onlyKernel`; updates HWM/timestamp; requires HWM seeded. |
| `seedHighWaterMark(address account, uint256 initialNav)` | `onlyFeeManager`; must precede first collection. |
| `setManagementFeeBps / setPerformanceFeeBps / setDistributor / setDistributorBps` | `onlyFeeManager`, bounded. |
| `proposeFeeManager(address)` · `acceptFeeManager()` | Two-step transfer. |

## MandateFactory

`ReentrancyGuard`. GPL-2.0-or-later. No privilege; every inner call is signature-authenticated.

`attach`, `attachBatch`, `reconfigure`, `replace`, `deployAndAttach` (+ `predictCloneAddress(address impl, bytes32 salt) → address`), `detach`, `detachBatch`. `receive()` accepts ETH only from the kernel.

## SafeModuleEnabler

MIT. Stateless. `enable(address module)` — must be invoked via `Safe.setup`'s delegatecall; resolves `address(this)` to the Safe and calls `enableModule(module)`.

## Interfaces

`IPermission`, `IBatchPermission`, `IConfigurablePermission`, `IFeePolicy`, `IOracle`, `IPermissionIntrospection`, `IAgentIdentityResolver` / `IAccountAgentIdentityResolver`, and the `SailCapabilities` library. See [IPermission & Context](../permissions/ipermission.md) and [extension interfaces](../permissions/extensions.md).
