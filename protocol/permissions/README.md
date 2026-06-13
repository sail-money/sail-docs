# Permission system

A **permission** is a contract that answers one question: *is this call allowed?* The kernel asks it on every dispatch and respects the answer. Everything Sail can do — every venue, every bound, every strategy constraint — is expressed as a permission. This is where you build.

This section covers:

* [IPermission & Context](ipermission.md) — the interface every permission implements, reproduced from source, field by field.
* [Full expressiveness](expressiveness.md) — why permissions are arbitrary Solidity rather than a constraint grammar, and what that buys.
* [Shared multi-tenant templates](shared-templates.md) — example implementations of the pattern: one deployment, per-account config, the opaque params blob, and the starter catalog. Reference examples, not drop-in production contracts.
* [Permission lifecycle](lifecycle.md) — registration, configuration, replacement, revocation, and manager rotation — each tied to the EIP-712 operation that authorizes it.
* [Extension interfaces](extensions.md) — optional introspection and agent-identity conventions for tooling.

## The mental model

```
Permission Signer ── registers ──▶ permission address joins the account's mandate
Manager ── dispatch names it ────▶ kernel staticcalls evaluate(txData, ctx)
evaluate returns true ───────────▶ Safe executes · false/revert/OOG ─▶ dispatch reverts
```

The kernel never inspects *what* a permission checks. It guarantees the [four evaluation properties](../concepts/evaluation-guarantees.md) — static, gas-capped, selective, fail-closed — and leaves the meaning entirely to the permission author. Adding a new DeFi venue is therefore a **contract deployment, not a protocol upgrade**.
