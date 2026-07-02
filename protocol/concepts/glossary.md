# Glossary

Precise definitions of the terms used throughout these docs. Where a term maps to a code identifier, that is noted.

**SMA (Separately Managed Account)** — A [Safe](https://safe.global) smart account registered with `SailKernel`, with the kernel enabled as a Safe module. Holds the owner's capital self-custodially.

**Owner** — The party that holds the Safe and custodies the SMA's capital, via the Safe's own owners and threshold. Can always revoke the manager.

**Permission Signer** — The address whose EIP-712 signatures authorize permission-registry operations (register, configure, replace, revoke, session, fee-policy). `AccountConfig.permissionSigner`. Cannot move assets.

**Manager** — The address whose EIP-712 signatures authorize dispatches. `AccountConfig.manager`. May be an EOA, multisig, MPC wallet, or autonomous agent. Cannot change the mandate.

**Submitter** — The `msg.sender` of a dispatch; the address that pays gas. Not an authority role; may be a relayer. Exposed to permissions as `ctx.submitter`.

**Mandate** — The set of permission contracts registered for an SMA. Defines what the manager is authorized to do. Not a document; a set of contracts.

**Permission** — A contract implementing `IPermission` that decides whether a given call is allowed, via `evaluate(txData, ctx) → bool`.

**Template** — A reusable permission *implementation*. Shared (multi-tenant) templates serve many accounts from one deployment, each configured independently; standalone templates are one instance per account.

**Dispatch** — A manager-signed request to execute one call through the SMA, naming one registered permission as its authorizer. `SailKernel.dispatch(...)`.

**Batch dispatch** — A manager-signed request to execute an ordered array of calls atomically, gated by one batch-aware permission (`IBatchPermission`). `SailKernel.dispatchBatch(...)`.

**Selective authorization** — The model in which the manager's signature names one registered permission and only that permission is evaluated.

**Fail-closed** — The property that any permission failure (false, revert, OOG, malformed return) reverts the whole dispatch. Deny-by-default.

**`Context` / `ctx`** — The read-only snapshot of the dispatch environment passed to a permission's `evaluate` (account, manager, submitter, target, selector, value, blockTimestamp, blockNumber).

**Kernel** — `SailKernel`, the single trusted execution contract. Registers accounts, holds the permission registry, verifies signatures, dispatches to the Safe, accounts for fees.

**Fee policy** — A contract implementing `IFeePolicy` that computes the maximum collectable fee for an account and records collection state. The reference implementation is `StandardFeePolicy`.

**Protocol cut** — The protocol's share of a manager-collected fee, in basis points, bounded by the immutable cap `MAX_PROTOCOL_CUT_BPS = 2500` (25%). Zero at launch.

**Registration fee** — A flat native-token fee charged per permission registration, bounded by the immutable cap `MAX_PERMISSION_FEE_WEI` (≤ `0.01` native). Live at launch (`0.00015` native; higher on BSC and HyperEVM).

**High-water mark (HWM)** — The highest NAV seen at collection time for an account; `StandardFeePolicy` charges performance fees only on gains above it.

**NAV** — Net asset value, supplied by the manager at fee collection. Not independently verified by the kernel; the fee policy is the guard against inflated NAV.

**Timelock** — The standalone `TimelockController` (48-hour delay) through which all governance parameter changes flow.

**`PERMISSION_GAS_CAP`** — The fixed gas budget (`150_000`) for each permission's `evaluate` staticcall. `BATCH_EVAL_GAS_CAP` (`1_000_000`) is the batch equivalent.

**`boundSalt`** — `keccak256(saltNonce, caller, permissionSigner, manager, feePolicy)`, the salt that binds an SMA's CREATE2 address to its principals.
