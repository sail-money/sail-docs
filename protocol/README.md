# Overview

Sail Protocol is a minimal account-abstraction primitive for **onchain separately managed accounts (SMAs)**, implemented for the EVM. It wraps a [Safe](https://safe.global) smart account with a permission-gating layer so that a designated **manager** — typically an autonomous agent — can execute transactions on the account's behalf, but only within bounds the account owner has authorized on-chain.

## The problem

A separately managed account is the structure professional asset management is built on: capital is titled to the owner, a manager executes within a mandate, and the mandate can be narrowed or revoked at any time. DeFi never reproduced it. Three gaps:

* **Pooled vaults give up custody and attribution.** Depositors mint shares of a single strategy, surrender account-level custody, and inherit the strategy's full risk profile shared across every other depositor.
* **Smart wallets have no mandate.** Self-custodial wallets preserve custody but have no native concept of a manager bounded by enforceable rules.
* **Agents need signing authority *and* enforceable bounds.** An autonomous agent managing capital must be able to transact continuously, yet must be constrained by something stronger than a prompt.

Sail fills the gap between them: a self-custodial account whose manager has bounded, code-enforced, revocable authority.

## How it works, in one screen

```
Owner ── deploys & owns ──▶ SMA (Safe, holds assets)
Owner ── signs mandate ───▶ Mandate (set of IPermission contracts)
Owner ── appoints ────────▶ Manager (agent; instant revocation)
Manager ─ signs dispatch ─▶ SailKernel ─ evaluates named permission (staticcall)
SailKernel ─ if true ─────▶ Safe executes the call · if false ─▶ revert
```

* Capital is held in the owner's **Safe**. The kernel never holds assets.
* The **mandate** is not a document — it is the set of permission contracts registered for the account.
* On each dispatch the manager's signature **names one** registered permission. The kernel evaluates only that permission, via `staticcall` under a fixed gas cap, and forwards the call to the Safe only if it returns `true`.
* Because permissions are arbitrary Solidity, **any DeFi primitive can be expressed as a permission**. Adding a new venue is a contract deployment, not a protocol upgrade.

## What's in the trusted core

| Component | Role |
| --- | --- |
| `SailKernel` | Account registration, permission registry, EIP-712 signature verification, manager dispatch (single & batch), fee accounting, principal tracking. The only trusted execution surface. |
| `SailGovernance` | Parameter store behind a 48-hour timelock: constitutional caps, the protocol cut, the registration fee, and the trusted Safe/fee-policy allowlists. Emergency pause with auto-expiry. |
| `TimelockController` | Standalone OpenZeppelin timelock (48h), deployed separately and injected into `SailGovernance`, which validates it at construction. |
| `MandateFactory` | UX orchestrator bundling configure → register into one transaction. Holds no privilege; every inner call is independently signature-authenticated. |
| `SafeModuleEnabler` | Stateless one-shot helper that enables the kernel as a Safe module during account creation. |
| `StandardFeePolicy` | Reference fee policy: management fee on AUM plus a performance fee above a per-account high-water mark. |

Permission templates and fee policies live **outside** the trusted core. A bug in a template affects only the accounts that registered it.

## Where to go next

* New to the model? Start with [Concepts](concepts/).
* Want the component-level picture? See [Architecture](architecture/).
* Building a permission? Jump to the [Permission system](permissions/) and [Guides](guides/).
* Need addresses or signatures? See [Reference](reference/).

{% hint style="warning" %}
The trusted core and shared templates are deployed on 11 chains (9 mainnets + 2 testnets) and were reviewed by [Octane](https://www.octane.security), an AI source-code security scanner, across three analyses. A security review is not a proof of correctness — do not use with funds you are not prepared to lose.
{% endhint %}
