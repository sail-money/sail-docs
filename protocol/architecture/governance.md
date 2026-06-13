# SailGovernance & Timelock

`SailGovernance` is the protocol parameter store. It holds two categories of settings — **constitutional caps** that are immutable after deployment, and **tunable parameters** that the current governance address may change, always through a **48-hour timelock**. License: GPL-2.0-or-later.

## Constitutional caps (immutable; no procedure can raise them)

| Cap | Value | Bounds |
| --- | --- | --- |
| `MAX_PROTOCOL_CUT_BPS` | `2500` (25%) | the protocol's share of any fee collection |
| `MAX_PERMISSION_FEE_WEI` | set at deploy, ≤ `0.001 ether` | the per-permission registration fee |
| `MAX_PERMISSIONS_CAP` | `100` | the per-account permission limit |

`MAX_PERMISSION_FEE_WEI` is `immutable` and the constructor itself reverts if it is set above `0.001 ether`. The other two are `constant`.

## Tunable parameters (within the caps, via timelock)

| Parameter | Setter | Default | Bound |
| --- | --- | --- | --- |
| `currentProtocolCutBps` | `setProtocolCutBps` | `0` | `MAX_PROTOCOL_CUT_BPS` |
| `permissionRegistrationFee` | `setPermissionRegistrationFee` | `0` | `MAX_PERMISSION_FEE_WEI` |
| `maxPermissionsPerAccount` | `setMaxPermissionsPerAccount` | `20` | `1 … MAX_PERMISSIONS_CAP` |

Every setter is `onlyTimelock`: changes are scheduled on the timelock, wait 48 hours, then execute. The protocol cut and registration fee are **zero at launch**.

## The injected timelock

`SailGovernance` does **not** build its timelock inline. A standalone OpenZeppelin `TimelockController` is deployed separately and injected via the constructor — this is what makes every constructor argument chain-independent and enables the [same-address deployment](../concepts/deterministic-deployment.md). The constructor then **validates the injected timelock** and reverts if any invariant fails:

| Check | Error |
| --- | --- |
| Minimum delay is **exactly** 48 hours | `TimelockDelayMismatch` |
| `initialGovernance` holds `PROPOSER_ROLE` | `GovernanceNotProposer` |
| `initialGovernance` holds `EXECUTOR_ROLE` (rejects open-executor timelocks) | `GovernanceNotExecutor` |
| The timelock self-administers its roles; the governance EOA does **not** hold the proposer-admin role | `TimelockNotSelfAdministered` |

`REQUIRED_TIMELOCK_DELAY` is `48 hours`; an exact match (not a lower bound) is required so the injected timelock reproduces the audited behaviour precisely.

## Two-step governance transfer

Governance transfer is `propose → accept` to prevent loss from a mistyped successor:

1. Current governance calls `proposeGovernance(candidate)` (via timelock).
2. Current governance schedules + executes `rotateTimelockRoles(old, new)` (via timelock) to hand `PROPOSER`/`EXECUTOR`/`CANCELLER` roles to the candidate and revoke them from the outgoing governance.
3. The candidate calls `acceptGovernance()`. This **reverts with `RolesNotYetRotated`** unless the candidate already holds `PROPOSER_ROLE` — eliminating any window where old governance retains timelock keys after handoff.

## Trusted allowlists

The kernel consults these governance-held allowlists at account creation and fee-policy changes:

| Allowlist | Gates |
| --- | --- |
| `trustedSafeFactory` | which Safe proxy factories `createAccount` may use |
| `trustedSafeSingleton` | which Safe singletons `createAccount` may use |
| `trustedModuleSetup` | which helper may be the `to` of Safe.setup's delegatecall (blocks attacker setup delegatecalls) |
| `trustedSafeProxyCodehash` | which proxy runtime codehashes count as a genuine Safe |
| `trustedFeePolicy` | which fee policies may be attached (blocks upgradeable/metamorphic policies) |

All five setters are `onlyTimelock`. The one exception is genesis: `bootstrapAllowlists(...)` lets the initial governance seed all five **once**, in the deployment transaction, bypassing the timelock — then `allowlistBootstrapped` latches `true` forever and every later change must go through the 48-hour timelock.

## Emergency pause

A separate `emergencyAdmin` (rotatable only via timelock) may `pause()` the kernel **without** a timelock delay, for fast incident response:

* The pause **auto-expires after 72 hours** (`pauseExpiry`); `isPaused()` returns `block.timestamp < pauseExpiry`.
* A `PAUSE_COOLDOWN` of 72 hours sits between consecutive pauses to prevent spam.
* `unpause()` lifts it early and clears the cooldown.

While paused, `dispatch`, `dispatchBatch`, `collectFees`, and permission *registration* revert — but **revocation, session revocation, manager rotation, and clearing a fee policy stay available**, so owners can always reduce exposure during an incident.

Continue to the [MandateFactory](mandate-factory.md), or the full [fee model](../fees-and-governance/fees.md) and [governance](../fees-and-governance/governance.md) pages.
