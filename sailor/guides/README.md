# Guides

Task-oriented walkthroughs, each grounded in real `sailor` commands. In rough order of the operator lifecycle:

1. [Deploy & predict an SMA](deploy-sma.md) — create the account, and compute its deterministic address up front.
2. [Build & register a mandate](build-a-mandate.md) — author permissions, then register them.
3. [Configure a shared template](configure-a-template.md) — use an example template end to end.
4. [Run a strategy & dispatch](run-a-strategy.md) — write the agent `tick()`, run it, and read a denied dispatch.
5. [Simulate before going live](simulate.md) — prove a permission off-chain (PASS / FAIL / REVERT).
6. [Multi-chain operation](multi-chain.md) — the same SMA address across the supported chains.
7. [Automate with GitHub Actions](ci.md) — run the agent on a schedule in CI.

Every command here is verified against the Sailor source. Add `--json` to most commands for machine-readable output (useful for agents and CI).
