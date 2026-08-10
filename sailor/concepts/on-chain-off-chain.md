# On-chain vs off-chain

The single most important line to internalize when operating with Sailor:

> **All financial bounds are enforced on-chain. Cadence and orchestration are off-chain, operator-side concerns.**

## What the chain enforces

The kernel evaluates the named [permission](../../protocol/permissions/) on **every** dispatch. Anything a permission checks — allowed venues, token allowlists, per-transaction amount caps, slippage bounds, recipients, LTV — is enforced on-chain, fail-closed, before any state change. No off-chain bug in Sailor can cause a dispatch that the registered permissions don't allow. If your agent tries to do something outside the mandate, the kernel reverts it.

This is why the mandate is the security boundary: once it's signed, the agent can run autonomously, because the *worst* it can do is bounded by contracts you approved.

## What the operator controls off-chain

Sailor (and your agent code) controls everything the chain does **not** decide:

* **Cadence** — how often the agent ticks (`sailor run` schedule, the GitHub Actions cron). The chain doesn't know or care how frequently you dispatch.
* **Which allowed action to take, and when** — your `tick()` decides *whether* to swap today; the permission decides whether a swap is *allowed at all*.
* **Inputs and data** — price feeds, signals, and any data your strategy reads. Sailor bakes in no third-party data; you supply your own (see [the Agent interface](../sdk/agent.md)).
* **Submission** — gas, nonces, relaying. Authority comes from the manager's signature, not the submitter, so a relayer can submit.

## A concrete example

Suppose you want an agent that dollar-cost-averages USDC into WETH, at most 100 USDC per trade, once a day, only on Uniswap V3.

* **On-chain (the permission):** router = Uniswap V3, `tokenIn = USDC`, `tokenOut = WETH`, `maxAmountPerTx = 100e6`, recipient = the SMA. The kernel enforces these on every dispatch.
* **Off-chain (your agent):** "once a day," "buy when my signal says so," "skip if balance is low." None of this is the kernel's concern — it's your `tick()` logic and your `sailor run` schedule.

If a bug makes your agent try to buy 1,000 USDC or swap on the wrong router, the permission returns false and the dispatch reverts. The cap is real because it's on-chain; the schedule is best-effort because it's off-chain.

Keep this split in mind when designing: **put every rule that protects capital into a permission**, and leave only timing and selection to the agent.

## Two modes, one codebase

The dashboard runs in one of two modes: live, or **Shipyard**, the simulation sandbox. They are not a flag on a shared server. Each is a separate process running the same server code, pointed at a different state root (`.sail/` versus `.shipyard/sandbox/`) on a different port, and the fork-lifecycle routes exist only on the Shipyard instance. Nothing in the live process can read or write the Shipyard root, and nothing in Shipyard can reach the live one.

That separation is what makes the boundary above testable: in Shipyard the kernel, the permission contracts, and the Safe are the real deployed contracts, carried in by a local fork of the chain, so a dispatch is evaluated by the same code that would evaluate it on mainnet. Only the money is fake. See [Shipyard](../shipyard.md).
