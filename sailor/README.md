# Overview

> The open-source operator toolkit — a **TypeScript SDK, a CLI, a local dashboard, and agent skills** — for building and running agent-managed Separately Managed Accounts on [Sail Protocol](../protocol/).

**Sailor is the off-chain operator layer.** [Sail Protocol](../protocol/) is the trusted on-chain core — the kernel, governance, and the permission model. Sailor is the tooling you use to drive that core: create a [Separately Managed Account](../protocol/concepts/smas.md), author and register a [mandate](../protocol/concepts/mandate.md), and run a strategy [agent](sdk/agent.md) that [dispatches](../protocol/architecture/dispatch.md) within the mandate's bounds — **on your own machine**.

{% hint style="info" %}
Sailor is **not** part of the trusted core. It wraps `SailKernel` dispatch, `MandateFactory` registration, and EIP-712 mandate signing — but every authority check still happens on-chain in the kernel. Sailor targets already-deployed kernels; it never deploys the protocol or holds custody.
{% endhint %}

## What you can build

Autonomous agents that transact digital assets, for any use case:

* **Trading** — spot, perps, DCA, rebalancing.
* **Yield** — lending, borrowing, liquidity providing, looping.
* **Prediction markets** — bounded bets on outcome venues.
* **Payments & treasury** — transfers, scheduled moves, operational flows.

Every agent operates inside a **mandate** — a set of on-chain permissions the protocol enforces on every transaction. The agent can't exceed it, and you can revoke it in one transaction. Sailor takes you end to end: deploy your SMA, build your strategy, sign its mandate, and run the agent yourself. When no shared template fits (perps, prediction markets, aggregators), you author your own `IPermission` contract — see [Build & register a mandate](guides/build-a-mandate.md).

## What's in the box

| Piece | What it does |
| --- | --- |
| **SDK** (`@sail.money/sailor/sdk`) | `SailorClient`, the `Agent` interface, encrypted keyring, EIP-712 signing, dispatch submission, deployment + chain registries, template encoders. See the [SDK reference](sdk/). |
| **CLI** (`sailor`) | Everything from `sailor init` to `sailor run`: keys, SMA deployment, the full mandate lifecycle, the agent loop, session control, doctor. See the [CLI reference](cli/). |
| **Dashboard** (`sailor ui`) | A local web app for onboarding, balances, mandate health, activity, and owner signing — read from the project's `.sail/`, no hosted backend. See the [Dashboard](dashboard.md). |
| **Skills** | Seventeen curated procedures under `.agents/skills/` that equip a coding agent across the whole workflow — setup, mandate authoring, template configuration (one skill per shared template), market data, transactions, and unattended automation. See [Skills](skills.md). |

## Install

Two ways — both scaffold the same project. Full detail: [npm package](packages.md) · [Docker](docker.md).

{% tabs %}
{% tab title="npm" %}
```bash
mkdir my-agent && cd my-agent && npm i @sail.money/sailor && npx sailor init
```

Requires Node.js ≥ 18.
{% endtab %}

{% tab title="Docker" %}
```bash
mkdir my-agent && cd my-agent
docker run -d --name agent -P -v "${PWD}:/workspace" sailmoney/sailor
docker exec agent sailor init
```

No Node.js required.
{% endtab %}
{% endtabs %}

## How you run it

Sailor's distinguishing model: **you operate it through your coding agent.** Scaffold a project, open it in Claude Code, Cursor, Codex, or any AI coding assistant, and say **"start"** — the scaffold's `AGENTS.md` and [skills](skills.md) drive the whole flow (SMA deployment, strategy definition, mandate authoring, testing, running). Every step has a direct CLI equivalent, so nothing is hidden behind the agent. These docs are written to be read by that agent too — see [For AI agents](../for-ai-agents.md) for a ready-made prompt and machine-readable context.

## Chains

The SDK bundles verified deployments for **11 chains** — mainnets Ethereum (1), Base (8453), Arbitrum (42161), Optimism (10), Unichain (130), BSC (56), World Chain (480), HyperEVM (999), MegaETH (4326); testnets Base Sepolia (84532) and Ethereum Sepolia (11155111). Every core contract sits at the same address on every chain via CREATE2, and the seven shared permission templates are deployed and registered on all of them. Query it with `sailor chains` or `getSailDeployment(chainId)`; the canonical record is [Protocol → Deployment addresses](../protocol/reference/addresses.md).

## Where to go next

* [Quickstart](getting-started/quickstart.md) — install, and go from zero to a dispatched transaction.
* [Operate Sailor with a coding agent](getting-started/coding-agent.md) — the flagship workflow.
* [Skills](skills.md) · [npm package](packages.md) · [Docker](docker.md) · [Dashboard](dashboard.md)
* [Concepts](concepts/) · [Guides](guides/) · [CLI reference](cli/) · [SDK reference](sdk/) · [Security](security.md) · [Troubleshooting](troubleshooting.md)

{% hint style="warning" %}
The Sail Protocol trusted core and its seven shared templates were reviewed by [Octane](https://www.octane.security), an AI source-code security scanner, across three analyses; the final analysis found no critical- or high-severity findings. That review covers the protocol contracts — **not** this toolkit. A security review is not a guarantee of correctness — do not operate with funds you are not prepared to lose. See [Security](security.md).
{% endhint %}