# Limitations

Honest statements of what Sail does **not** protect against. None of these are bugs — they are deliberate boundaries of the trusted core. Understanding them is a prerequisite to using the protocol safely.

## 1. Permission correctness is the author's responsibility

The kernel guarantees a permission cannot harm the kernel or other accounts, and that a *failing* permission denies. It does **not** guarantee a permission is *correct*. If a registered permission's `evaluate` returns `true` for a call that drains the account, the kernel will execute that call.

Consequences:

* **Register only audited or trusted permission contracts.** A permissive bug in a permission is a loss for the accounts that registered it.
* **Upgradeable permissions are a trust escalation.** The kernel binds authorization to a permission *address*. If that address is an upgradeable proxy, changing its implementation requires **no new kernel signature** — so a registered upgradeable permission can later behave differently than when it was approved. Prefer non-upgradeable permissions. (Whitepaper §8.2.)
* The seven shared templates are deployed against the current kernel (see [addresses](../reference/addresses.md)). Six of them were included in the [Octane security review](audits.md); the seventh, `WithdrawPermission`, was rewritten afterward (v2 — bounded vault/pool exits) and is **not** covered by that review (internal test coverage only). All remain **reference implementations** — treat them as starting points to read, verify, and test, not as audited drop-in production contracts.

## 2. Manager-attested NAV (the self-managed-SMA framing)

`collectFees` takes a `currentNav` supplied by the **manager**; the kernel does not verify it. The kernel enforces only that the requested `grossFee` does not exceed the fee policy's computed maximum — but that maximum is itself a function of the manager-supplied NAV. A dishonest manager could inflate `currentNav` to unlock a larger fee ceiling.

* `StandardFeePolicy` trusts the NAV by design. This is appropriate for a **self-managed SMA**, where the owner *is* (or fully trusts) the manager.
* For a manager the owner does **not** fully trust, use a fee policy that validates NAV through an oracle inside `computeFee`, rather than the reference policy.
* Denomination must be consistent: `grossFee`, `currentNav`, and the `feeAsset` must use the same units, or the fee ceiling is meaningless.

## 3. Off-chain venue components are out of the kernel's view

A permission can only check what is visible on-chain at dispatch time. It cannot reason about off-chain components of a venue — sequencer behavior, off-chain order books, oracle update cadence beyond the freshness bound it checks, or MEV in the surrounding transaction. Oracle-gated templates check `updatedAt` freshness and (should) gate on L2 sequencer uptime, but the quality of those protections is only as good as the oracle and the bounds the permission author configures.

## Also worth knowing

* **No layered "AND" composition in the kernel.** Selective authorization evaluates exactly one named permission per dispatch. Compound rules must be expressed inside a single permission (or a batch permission), not by requiring several permissions to jointly approve.
* **Force-sent ETH is unrecoverable** in `MandateFactory` (no sweep function); an accepted residual since `receive()` already blocks normal deposits.
* **Governance is trusted within its caps.** Governance cannot exceed the constitutional caps or move user funds, but it does control tunable parameters and the trusted allowlists, behind the 48-hour timelock.

If you find something here that looks like more than a documented limitation, report it: **hello@sail.money**.
