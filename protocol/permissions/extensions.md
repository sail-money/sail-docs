# Extension interfaces

Beyond `IPermission`, templates **may** implement optional interfaces that expose metadata to off-chain tooling. These are conventions for the tooling layer — **the kernel never reads or verifies any of them**, and they have no effect on whether a dispatch is permitted.

## IPermissionIntrospection

Stable identity and capability metadata for indexers and UIs:

```solidity
interface IPermissionIntrospection {
    function permissionId() external view returns (bytes32);      // template TYPE id, stable across deployments
    function permissionVersion() external view returns (bytes32); // bumps on breaking logic changes
    function metadataURI() external view returns (string memory); // ipfs:// , ar:// , or https URL ("" if none)
    function capabilityIds() external view returns (bytes32[] memory); // from SailCapabilities (non-empty)
}
```

* `permissionId` identifies the template **type**, not the instance — two deployments of the same template return the same id. Convention: `keccak256("sail.permission.<ContractName>.v1")`. Use the contract address to distinguish instances.
* The kernel exposes `getPermissionsWithInfo(account)`, which reads `isBatchPermission()` and the introspection fields on each registered permission via `try/catch` (returning zero/false for non-implementers). It is an off-chain convenience view — never call it from dispatch.

## SailCapabilities

Canonical capability identifiers, each `keccak256("sail.capability.<name>.v<n>")`. Shipped templates declare one or more:

| Constant | Declared by |
| --- | --- |
| `BOUNDED_SWAP` | `SharedBoundedSwapPermission` |
| `BOUNDED_BORROW` | `SharedBoundedBorrowPermission` |
| `TRANSFER_TARGET` | `SharedTransferTargetPermission` |
| `DEFI_BUNDLE` | `SharedDeFiBundlePermission` |
| `PENDLE_YIELD` | `SharedPendlePermission` |
| `AMM_LIQUIDITY` | `SharedAMMLiquidityPermission` |
| `BATCH_DISPATCH` | `SharedApproveAndCallBatchPermission` |
| `AGENT_IDENTITY` | any template exposing agent-identity metadata |

Third parties may define their own ids following the same convention; the hash space makes collisions impractical.

## Agent identity

Two optional resolvers expose an `AgentIdentityRef` (namespace, chainId, identity registry, agentId, agent wallet) for off-chain discovery:

* `IAgentIdentityResolver.agentIdentity()` — one fixed identity for a single-account/fixed-agent template.
* `IAccountAgentIdentityResolver.agentIdentityFor(account)` — per-account identity for shared templates (returns a zero struct when unset; must not revert). `BaseSharedPermission` implements this and lets the Permission Signer set it via `setAgentIdentity` / `setAgentIdentityDirect`.

{% hint style="info" %}
**Identity is metadata, not authorization.** The kernel never reads agent identity. A template that wants to *enforce* an identity constraint (e.g. require `ctx.manager == agentWallet`) must do so inside its own `evaluate()`. Reputation, validation, and curation-registry integration are explicitly out of scope; live ERC-8004 registry resolution is a possible future extension.
{% endhint %}

## IBatchPermission

The one extension the kernel *does* call — for batch dispatch. A batch-aware template implements `evaluateBatch(Call[], BatchContext) → bool` and `isBatchPermission() → true` (the kernel staticcalls the latter to detect batch support). See [single & batch dispatch](../architecture/dispatch.md).
