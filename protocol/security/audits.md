# Octane security review

The trusted core and the seven shared permission templates were reviewed by **[Octane](https://www.octane.security)**, an AI source-code security scanner, across **three successive analyses** (2026-06-24, 2026-06-26, 2026-06-29). The **third and final analysis (2026-06-29) identified no critical- or high-severity findings**; all reported vulnerabilities were resolved or acknowledged, and the remaining lower-severity warnings are documented, accepted by design, or out of scope.

## What was reviewed

Both the trusted core — `SailKernel`, `SailGovernance`, its `TimelockController`, and the core interfaces — **and** the seven shared permission templates: `SwapPermission`, `SwapPermissionNoOracle`, `BorrowPermission`, `DepositPermission`, `WithdrawPermission`, `TransferPermission`, and `ApproveAndCallBatchPermission`.

**Review boundary.** The analyses cover `main` through PR #79 (commit `8d1e122`). Changes on `main` after that point are limited to documentation and deployment metadata, not trusted-core logic. Scope was defined by files and contracts; the reviewer did not state a line-count figure.

## Reports

The reports are Octane's signed deliverables, published as PDFs in the repository. The most recent (2026-06-29) reflects the current state of the reviewed code; earlier reports are retained for transparency.

| Analysis | Date | Pages | Report |
| --- | --- | :---: | --- |
| Third (most recent) | 2026-06-29 | 153 | [PDF](https://github.com/sail-money/Protocol/raw/main/docs/security/octane-security-analysis-03-2026-06-29.pdf) |
| Second | 2026-06-26 | 175 | [PDF](https://github.com/sail-money/Protocol/raw/main/docs/security/octane-security-analysis-02-2026-06-26.pdf) |
| First | 2026-06-24 | 108 | [PDF](https://github.com/sail-money/Protocol/raw/main/docs/security/octane-security-analysis-01-2026-06-24.pdf) |

Several findings map to mechanisms in the deployed bytecode and are referenced in [Guarantees](guarantees.md) — for example **#1** (trusted module-setup allowlist, closing the arbitrary setup-delegatecall surface during `createAccount`), **#4 / #4a / #4b** (principal-bound CREATE2 salt and proxy-codehash / module-enabled checks), **#7** (nonce-epoch invalidation of pre-signed dispatches), and **#16** (counterfactual addresses cannot be squatted with different principals).

## Not a guarantee

A security review is **not** a proof of correctness. It reduces risk in the reviewed code; it does not eliminate it, and it does not extend to code deployed by users. In particular, the correctness of any user-deployed permission or fee policy remains the author's responsibility — see [Limitations](limitations.md).

## Scope boundary

The trusted core is the primary review surface. The shared permission templates and the reference fee policy were included in the review, but they remain **reference implementations** outside the trusted core: their blast radius is bounded to the accounts that opt into them. Register them only if you choose to trust them.

## Reporting a vulnerability

Email **security@sail.money**. Please include enough detail to reproduce, and allow time for a fix before public disclosure. The contracts carry a `@custom:security-contact security@sail.money` tag in their source, and the canonical [Security Policy](https://github.com/sail-money/Protocol/blob/main/SECURITY.md) lives at the repository root.