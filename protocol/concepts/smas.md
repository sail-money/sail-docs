# Separately Managed Accounts

A **separately managed account (SMA)** is the structure professional asset management is built on. Capital is held in an account titled to the owner; a designated manager executes within bounds set by a mandate. Unlike a pooled fund:

* assets remain **separately custodied** for each owner;
* the manager has **bounded authority**, not full discretion;
* the mandate can be **revised, narrowed, or revoked** at any time;
* performance is **attributed per account**.

Off-chain, these properties have kept the SMA an institutional product — the cost of custodians, legal infrastructure, and reconciliation is prohibitive below account minimums of \$100k–\$1M.

## The onchain SMA

Sail expresses the SMA relationship as a minimal on-chain primitive:

* **Custody** is a self-custodial [Safe](https://safe.global) owned by the LP. The Sail kernel is enabled as a Safe **module** — it can ask the Safe to execute calls, but only through the gated dispatch path, and it can never move assets outside that path.
* **The manager** holds no assets. It holds a key whose signature authorizes individual transactions, each of which the kernel checks against the account's registered permissions before the Safe executes it.
* **The mandate** is a set of on-chain permission contracts. Revising it is a signed on-chain operation; revoking the manager takes effect in a single block.

Because the manager is a key, not a person, it can be an **autonomous agent**. And because the mandate is enforced by the kernel on every call, the agent's authority is bounded by code, not by trust.

## Why it matters for agents

A traditional mandate is static — one template applied uniformly across a book of accounts. An agent operating inside an onchain SMA can run a **distinct strategy per account**, calibrated to each owner's balance, risk tolerance, and horizon, while sharing the same infrastructure, permission templates, and fee model. The marginal cost of one more account is one more agent execution.

## What the kernel is *not*

* It is **not a custodian.** Assets never leave the Safe except through a dispatch that satisfies a registered permission.
* It is **not a strategy engine.** It knows nothing about DeFi venues; it evaluates a permission contract and respects the answer.
* It is **not an upgrade surface for venues.** New venues are new permission contracts, deployed permissionlessly.

Next: [the three roles](roles.md) that make this work.
