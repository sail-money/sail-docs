# Concepts

The ideas you need before building on Sail, in reading order:

* [Separately Managed Accounts](smas.md) — what an onchain SMA is and why it exists.
* [The three roles](roles.md) — Owner, Permission Signer, Manager, and who holds what authority.
* [The mandate & selective dispatch](mandate.md) — the mandate is a set of contracts, and each dispatch names one.
* [The four evaluation guarantees](evaluation-guarantees.md) — static evaluation, gas isolation, selective authorization, fail-closed.
* [Deterministic deployment](deterministic-deployment.md) — why the core and every SMA have the same address on every chain.
* [Glossary](glossary.md) — precise definitions of every term.

The terminology hierarchy, from largest to smallest:

> **SMA** (a Safe account registered with the kernel) → **Mandate** (the set of permissions registered for that SMA) → **Permission** (one `IPermission` contract that authorizes a class of calls) → **Template** (a reusable permission implementation that many accounts configure independently).
