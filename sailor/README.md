# Overview

> The operator toolkit for Sail Protocol — a TypeScript SDK, a CLI, and a local dashboard for building and running mandated agent strategies.

**Sailor is the off-chain operator layer.** [Sail Protocol](../protocol/) is the trusted on-chain core — the kernel, governance, and the permission model. Sailor is the tooling an operator uses to drive that core: create a [Separately Managed Account](../protocol/concepts/smas.md), author and register a [mandate](../protocol/concepts/mandate.md), and run a strategy [agent](sdk/agent.md) that [dispatches](../protocol/architecture/dispatch.md) within the mandate's bounds.

{% hint style="info" %}
Sailor is **not** part of the trusted core. It wraps `SailKernel` dispatch, `MandateFactory` registration, and EIP-712 mandate signing — but every authority check still happens on-chain in the kernel. Sailor targets already-deployed kernels; it never deploys the protocol or holds custody.
{% endhint %}

## Who it's for, and how you run it

Sailor is for developers building and operating an autonomous strategy on an SMA. Its distinguishing model: **you operate Sailor through your coding agent.** You scaffold a project, open it in Claude Code, Cursor, or any AI coding assistant, and the assistant drives the whole flow — SMA deployment, strategy definition, mandate authoring, testing, running — guided by an `AGENTS.md` and a set of skills that ship in the scaffold.

That means these docs serve two readers at once: **you**, and **the coding agent reading them on your behalf**. Both are first-class — these docs are a live MCP server your agent can query directly. See [For AI agents](../for-ai-agents.md).

## What's inside

| Piece | What it is |
| --- | --- |
| **CLI** (`sailor`) | The command surface: scaffold, keys, account, mandate, onboard, station, run, session, status, doctor, capabilities, chains, ui. See the [CLI reference](cli/). |
| **SDK** (`@sail.money/sailor/sdk`) | `SailorClient`, the `Agent` interface, EIP-712 signing helpers, kernel-capability detection, ABIs, deployment + chain registries. See the [SDK reference](sdk/). |
| **Dashboard** (`sailor ui`) | A local React app showing account state, mandate health, signer balances, and recent activity — read from the project's `.sail/` directory, no hosted backend. |
| **Scaffold** (`sailor init`) | A neutral agent starter: a blank agent loop, a Foundry workspace for permission contracts, a GitHub Actions cron job, and the operator guide (`AGENTS.md` + on-demand skills). |

## Where to go next

* [Quickstart](getting-started/quickstart.md) — install, and go from zero to a dispatched transaction.
* [Operate Sailor with a coding agent](getting-started/coding-agent.md) — the flagship workflow.
* [Concepts](concepts/) — how Sailor's vocabulary maps to the Protocol, and where the on-chain/off-chain line sits.
* [Guides](guides/) · [CLI reference](cli/) · [SDK reference](sdk/) · [Troubleshooting](troubleshooting.md)

{% hint style="warning" %}
The Sail Protocol trusted core is under an ongoing external audit and is not final. Sailor is published and functional, but do not operate it with funds you are not prepared to lose.
{% endhint %}
