# Governance

Sail governance is deliberately small: a fixed set of tunable parameters within immutable caps, all changes behind a 48-hour timelock, plus a narrow emergency pause. The full mechanics live in [Architecture → SailGovernance](../architecture/governance.md); this page is the operator-facing summary.

## What governance can change (and the caps it can't exceed)

| Parameter | Setter (timelock) | Default | Hard cap (immutable) |
| --- | --- | --- | --- |
| Protocol cut | `setProtocolCutBps` | 0 | `MAX_PROTOCOL_CUT_BPS = 2500` (25%) |
| Registration fee | `setPermissionRegistrationFee` | 0 | `MAX_PERMISSION_FEE_WEI ≤ 0.001 ETH` |
| Permissions per account | `setMaxPermissionsPerAccount` | 20 | `MAX_PERMISSIONS_CAP = 100` |
| Trusted Safe factory / singleton / module-setup / proxy-codehash / fee-policy allowlists | `setTrusted*` | seeded at genesis | — |
| Treasury (on the kernel) | `setTreasury` | set at deploy | — |
| Emergency admin | `rotateEmergencyAdmin` | set at deploy | — |

No governance action can raise a constitutional cap. Every setter above is `onlyTimelock`: **schedule → wait 48 hours → execute**.

## The 48-hour timelock

All parameter changes flow through a standalone OpenZeppelin `TimelockController` with a minimum delay of **exactly** 48 hours. It is deployed separately and injected into `SailGovernance`, whose constructor validates the delay, the proposer/executor roles, and self-administration (see [Architecture → SailGovernance](../architecture/governance.md)). Genesis allowlist seeding via `bootstrapAllowlists` is the one timelock bypass, usable exactly once, then permanently latched off.

## Two-step governance transfer

`proposeGovernance → acceptGovernance`, with a mandatory `rotateTimelockRoles` in between so the incoming governance holds the timelock's proposer/executor/canceller roles before it accepts — there is no window where the old governance keeps timelock keys after handoff.

## Emergency pause

A separate `emergencyAdmin` can `pause()` the kernel **without** a timelock delay, for fast incident response:

* **Auto-expires after 72 hours.** No action needed to resume.
* **72-hour cooldown** between pauses; `unpause()` lifts early.
* While paused: `dispatch`, `dispatchBatch`, `collectFees`, and permission *registration* are blocked — but **revocation, session revocation, manager rotation, and clearing a fee policy stay available**, so owners can always reduce exposure during an incident.

The emergency admin can pause but cannot change parameters or move funds; parameter authority remains with the timelock.
