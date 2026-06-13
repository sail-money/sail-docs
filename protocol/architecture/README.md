# Architecture

Sail draws a hard line between a small **trusted core** and an open, **untrusted periphery**. The security analysis lives entirely in the core; everything outside it is contained by the [four evaluation guarantees](../concepts/evaluation-guarantees.md).

## Trusted core vs. periphery

| | Contracts | Trust |
| --- | --- | --- |
| **Trusted core** | `SailKernel`, `SailGovernance`, `TimelockController` | Audited; their correctness is assumed. The kernel and governance are the only contracts that can move Safe assets or change parameters. |
| **Trusted helpers** | `SafeModuleEnabler`, `MandateFactory`, `StandardFeePolicy` | Constrained by construction: the enabler is stateless, the factory holds no privilege, and fee policies must be on a governance allowlist. |
| **Periphery** | Permission templates, custom fee policies, oracles | User-deployed, unaudited by default. A bug here affects only the accounts that opted into it. The kernel never trusts them. |

> **Blast radius.** A bug in a permission template affects only accounts that registered it; a bug in a fee policy affects only accounts using it. Nothing in the periphery can compromise the kernel or another account.

## Component map

| Component | Responsibility | Page |
| --- | --- | --- |
| `SailKernel` | Account registration, permission registry, EIP-712 verification, single & batch dispatch, fee accounting, principal tracking. | [SailKernel](kernel.md) |
| `SailGovernance` | Constitutional caps + tunable parameters behind a 48h timelock; emergency pause; trusted allowlists. | [Governance](governance.md) |
| `TimelockController` | Standalone 48h timelock, injected into governance and validated at construction. | [Governance](governance.md) |
| `MandateFactory` | Bundles configure → register into one transaction. No privilege. | [MandateFactory](mandate-factory.md) |
| `SafeModuleEnabler` | Enables the kernel as a Safe module during account creation. | [SafeModuleEnabler](safe-module-enabler.md) |
| `StandardFeePolicy` | Reference 2-and-20 fee policy. | [Fee model](../fees-and-governance/fees.md) |

## Dependency direction

```
SailKernel ── reads params, cut, caps, allowlists ──▶ SailGovernance ──▶ TimelockController
SailKernel ── computeFee / recordCollection ────────▶ IFeePolicy (StandardFeePolicy or custom)
SailKernel ── evaluate / evaluateBatch (staticcall) ▶ IPermission / IBatchPermission (periphery)
SailKernel ── execTransactionFromModule ───────────▶ ISafe (the SMA)
```

The kernel inherits OpenZeppelin's `EIP712` and `ReentrancyGuard`. It reads — but never writes — governance state, and it calls out to fee policies and permissions only through tightly bounded paths (`recordCollection` after a CEI-ordered fee split; `evaluate` under `staticcall` + gas cap).

## Two dispatch paths

* **Single dispatch** (`dispatch`) — one call, gated by one named permission.
* **Batch dispatch** (`dispatchBatch`) — an ordered array of calls executed atomically, gated by one named batch-aware permission.

Both follow selective authorization. See [single & batch dispatch](dispatch.md).
