# Sailor & the Protocol

Sailor builds on the Protocol's model — it isn't a different one. Most terms mean exactly what the [Protocol glossary](../../protocol/concepts/glossary.md) says. Two of them — **template** and **mandate** — are the operational terms that emerge once you actually *build and deploy* permissions with the SDK and CLI; this page pins down precisely what they map to on-chain.

| Term | Meaning | In Sailor |
| --- | --- | --- |
| [SMA](../../protocol/concepts/smas.md) | A Safe registered with `SailKernel`; holds the capital self-custodially. | `.sail/account.json`; created via `sailor onboard --new-sma`; SDK `client.account`. |
| [Permission](../../protocol/permissions/) | A single bounded rule — one class of action the manager is whitelisted to take (e.g. *"swap USDC→WETH up to 10k per call on this router"*), with its limits. A permission is a *rule*, not a deployed thing on its own; it is carried by a template and enforced by a mandate. | Authored/configured in the Foundry workspace. |
| [Template](../../protocol/permissions/shared-templates.md) | A set of permissions that has **not** been deployed — a reusable blueprint you build real mandates from. Think *class*: a reference, not a live object. | `sailor mandate templates`; the `template` field on a mandate; SDK `PermissionTemplate`. Treated as [examples](../guides/configure-a-template.md). |
| [Mandate](../../protocol/concepts/mandate.md) | A template (or a set of permissions built from scratch) **deployed into a smart contract** and attached to the SMA via the kernel's registry. Think *object*: the live, on-chain instance of a template. It is an `IPermission` implementation the kernel holds an address to and consults on every dispatch. | `sailor mandate *`; SDK `client.mandate`; the signed `.sail/mandate.json` the runner executes against. Each has an on-chain `address` (see `mandates.json`). |
| [Manager](../../protocol/concepts/roles.md) | The key that signs dispatches — here, your agent. | The encrypted agent wallet at `.sail/keys/manager.json`. |
| [Dispatch](../../protocol/architecture/dispatch.md) | A manager-signed call the kernel evaluates against one named mandate and executes if it's within bounds. | `sailor run`; SDK `client.dispatch.single` / `.batch`. |

## Template → mandate: class vs object

The distinction is the whole point of Sailor's build step:

* A **template** is a *set of permissions that has not been deployed*. It's source you read, adapt, and parameterize — a blueprint. On its own it controls nothing.
* A **mandate** is what you get when that template (or a from-scratch set of permissions) is **deployed into a smart contract** — an `IPermission` instance — and **attached to your SMA** through the kernel's permission registry. It's the live object: it has an on-chain address, and the kernel consults it to decide whether a manager's call is allowed.

`sailor mandate deploy/attach` is exactly this build step: it turns a template into a deployed, registered mandate. Sailor's `mandates.json` reflects it directly — each mandate record carries both its on-chain `address` and the `template` it was built from.

So the layering is:

```
permission (a rule)  →  template (a set of rules, undeployed)  →  mandate (that set, deployed & attached to the SMA)
```

An SMA's full set of attached mandates is the complete description of what its manager may do. The manager never has open-ended control: it can only do what some attached mandate already whitelists, and only the kernel — never Sailor — decides whether a given call qualifies.

## Which side of the line is Sailor on?

```
                        on-chain (trusted core)            off-chain (Sailor)
  ┌─────────────────────────────────────────┐   ┌──────────────────────────────────┐
  │  SailKernel · SailGovernance · Safe SMA  │ ◀ │  CLI · SDK · agent runner · UI    │
  │  evaluates mandates, moves assets        │   │  builds & signs, schedules, reads │
  └─────────────────────────────────────────┘   └──────────────────────────────────┘
```

Sailor builds transactions, signs EIP-712 messages, and submits them. Every authority decision — *is this call allowed?* — is made by the kernel on-chain against the deployed mandate. Sailor cannot widen what a mandate permits; it can only help you express, deploy, and operate it.

## Sailor helps you express bounds — it never closes the menu

The Protocol's [full-expressiveness](../../protocol/permissions/expressiveness.md) property carries over: a mandate is arbitrary Solidity (an `IPermission` implementation), so any rule you can express in code can be a permission — Sailor never forces a specific template or limits what you can express. The shipped templates are starting points; you can author any permission set, deploy it as a mandate, and Sailor will simulate, attach, and dispatch against it. Sailor's job is to make expressing and operating fully-bounded mandates fast — not to constrain the set of expressible bounds.

Continue to [on-chain vs off-chain](on-chain-off-chain.md).
