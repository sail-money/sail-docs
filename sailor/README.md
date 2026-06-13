# Sailor

> The operator toolkit for Sail Protocol — SDK, CLI, and local dashboard for building and running mandated agents.

Sailor is the off-chain operator layer for Sail Protocol: the tooling an operator uses to create a Separately Managed Account, register a mandate, and run a strategy agent against it. It wraps `SailKernel` dispatch, `MandateFactory` registration, and EIP-712 mandate signing behind a TypeScript SDK, a CLI, and a local dashboard — driven by your coding agent.

{% hint style="info" %}
**This section is being written.** Full Sailor documentation — installation, the agent-driven workflow, the CLI and SDK references, and CI — lands next. For now, see the [Sailor repository](https://github.com/sail-money/Sailor) and the protocol-level [Guides](../protocol/guides/) for the mechanics Sailor automates.
{% endhint %}

Get started today:

```bash
mkdir my-agent && cd my-agent && npm i @sail.money/sailor && npx sailor init
```

Then open the folder in Claude Code, Cursor, or any AI coding assistant and say **"start"**.
