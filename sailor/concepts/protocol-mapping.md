# Sailor & the Protocol

Sailor uses the Protocol's vocabulary exactly. If a term is defined in the [Protocol glossary](../../protocol/concepts/glossary.md), it means the same thing here — Sailor is tooling *for* that model, not a different one.

| Term | Meaning (same as the Protocol) | In Sailor |
| --- | --- | --- |
| [SMA](../../protocol/concepts/smas.md) | A Safe registered with `SailKernel`; holds the capital self-custodially. | `.sail/account.json`; created via `sailor onboard --new-sma`; SDK `client.account`. |
| [Mandate](../../protocol/concepts/mandate.md) | The set of registered `IPermission` contracts. | `sailor mandate *`; SDK `client.mandate`; the signed `.sail/mandate.json` the runner executes against. |
| [Permission](../../protocol/permissions/) | One contract that authorizes a class of calls. | Authored in the Foundry workspace; deployed/attached via `sailor mandate deploy/attach`. |
| [Template](../../protocol/permissions/shared-templates.md) | A reusable permission implementation. | `sailor mandate templates`; SDK `PermissionTemplate`. Treated as [examples](../guides/configure-a-template.md). |
| [Manager](../../protocol/concepts/roles.md) | The key that signs dispatches — here, your agent. | The encrypted agent wallet at `.sail/keys/manager.json`. |
| [Dispatch](../../protocol/architecture/dispatch.md) | A manager-signed call the kernel evaluates and executes. | `sailor run`; SDK `client.dispatch.single` / `.batch`. |

## Which side of the line is Sailor on?

```
                        on-chain (trusted core)            off-chain (Sailor)
  ┌─────────────────────────────────────────┐   ┌──────────────────────────────────┐
  │  SailKernel · SailGovernance · Safe SMA  │ ◀ │  CLI · SDK · agent runner · UI    │
  │  evaluates permissions, moves assets     │   │  builds & signs, schedules, reads │
  └─────────────────────────────────────────┘   └──────────────────────────────────┘
```

Sailor builds transactions, signs EIP-712 messages, and submits them. Every authority decision — *is this call allowed?* — is made by the kernel on-chain. Sailor cannot widen what a mandate permits; it can only help you express and operate it.

## Sailor helps you express bounds — it never closes the menu

The Protocol's [full-expressiveness](../../protocol/permissions/expressiveness.md) property carries over: a permission is arbitrary Solidity, so Sailor never forces a specific template or limits what you can express. The shipped templates are starting points; you can author any `IPermission` and Sailor will deploy, simulate, register, and dispatch against it. Sailor's job is to make expressing and operating a fully-bounded mandate fast — not to constrain the set of expressible bounds.

Continue to [on-chain vs off-chain](on-chain-off-chain.md).
