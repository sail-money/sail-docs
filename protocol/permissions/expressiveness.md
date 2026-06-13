# Full expressiveness

Most access-control systems define a **constraint grammar** — a fixed vocabulary of rules the system knows how to evaluate (allowlists, amount caps, time windows). The grammar bounds what can be expressed, and extending it means changing the trusted system.

Sail inverts the trade-off. The kernel knows **nothing** about DeFi venues. It calls `evaluate()` on a permission contract and respects the boolean. A permission is **arbitrary Solidity**, so it can express anything Solidity can compute within the gas budget:

* decode a Uniswap `exactInputSingle` and check the router, both tokens, the amount cap, and an oracle-derived slippage bound;
* read a lending protocol's account data and reject a borrow that would exceed a target LTV;
* require the swap recipient to be the SMA itself;
* gate on `block.timestamp` for a vesting window;
* require `ctx.manager` to equal a specific agent wallet.

None of that vocabulary lives in the kernel.

## What this buys

* **Permissionless venue support.** Adding a new DeFi integration is a **contract deployment, not a protocol upgrade**. No governance vote, no kernel change.
* **Isolated audit surface.** The kernel is auditable on its own; each permission is auditable on its own. A bug in one permission is contained to the accounts that registered it.
* **Future-proofing.** A venue or primitive that does not exist yet is supported the moment someone writes a permission for it.

## The boundary of responsibility

The kernel's [four guarantees](../concepts/evaluation-guarantees.md) — `staticcall`, gas cap, selective authorization, fail-closed — protect the *kernel* from the permission. They do **not** make the permission correct. Everything inside that envelope is the author's responsibility:

> If a permission's `evaluate` returns `true` for a call that drains the account, the kernel will execute it. The guarantees ensure the permission cannot harm the kernel or other accounts, and that a *failing* permission denies — but they cannot ensure a *permissive* permission is wise.

This is the central trade-off to internalize before deploying: **register only permission contracts you have audited or trust.** The kernel binds authorization to a permission *address*; if that address is an upgradeable proxy, a change to its implementation needs no new signature (see [the lifecycle](lifecycle.md) and [Security → limitations](../security/limitations.md)). Prefer non-upgradeable, audited permissions.
