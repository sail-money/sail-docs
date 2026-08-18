# Overview

> Turn any coding agent into a money agent. Sailor is the open-source harness for [Sail Protocol](../protocol/): it deploys your SMA, builds your permissions, and runs your strategy on your own machine.

Sailor is the operator layer for building and running money agents on Sail Protocol. It ships through the coding agents developers already use (Claude, Cursor, Codex, Gemini, Grok, Hermes, and other compatible agents): from a scaffolded project, it deploys a separately managed account, authors and registers the mandate, and runs the strategy, all locally. No single agent is required.

Funds remain in your own **separately managed account (SMA)**. The agent never holds your owner key and acts only through a **mandate** — deterministic on-chain permissions the [protocol](../protocol/) checks on every transaction. That bound is what makes a Sailor agent safe to run with real capital.

{% hint style="info" %}
Sailor is the **harness**; [Sail Protocol](../protocol/) is the trusted on-chain core. Sailor guides and operates; the kernel enforces. Sailor targets already-deployed kernels — it never deploys the protocol or holds custody.
{% endhint %}

## What you can build

Autonomous money agents for any use case:

* **Trading** — spot, DCA, rebalancing.
* **Yield** — lending, borrowing, liquidity providing, staking, looping.
* **Payments** — transfers, scheduled moves, operational flows.

These are examples, not a boundary. Permissions are arbitrary Solidity, so anything in DeFi can be expressed as a permission and operated by an agent. When no shared template fits, you author your own `IPermission` — see [Build & register a mandate](guides/build-a-mandate.md).

## How it works — five stations

Open the scaffold in Claude Code, Cursor, Codex, or any AI coding agent and say **start**. The agent walks the journey with you, five stations end to end:

1. **Arrive** — set up your self-custodial SMA.
2. **Strategy** — define what your agent does in DeFi.
3. **Mandate** — the on-chain bounds it runs inside.
4. **Agent** — build the tick loop.
5. **Sail** — launch, operate, and run it locally.

Every step has a direct CLI equivalent, so nothing is hidden behind the agent. These docs are written to be read by that agent too — see [For AI agents](../for-ai-agents.md) for a ready-made prompt and machine-readable context.

## Components

| Piece | What it does |
| --- | --- |
| **SDK** (`@sail.money/sailor/sdk`) | `SailorClient`, the `Agent` interface, encrypted keyring, EIP-712 signing, dispatch submission, deployment + chain registries, template encoders. See the [SDK reference](sdk/). |
| **CLI** (`sailor`) | Everything from `sailor init` to `sailor run`: keys, SMA deployment, the full mandate lifecycle, the agent loop, session control, doctor. See the [CLI reference](cli/). |
| **Dashboard** (`sailor ui`) | A local web app for onboarding, wallet gas balances, mandate health, activity, and owner signing — read from the project's `.sail/`, no hosted backend. See the [Dashboard](dashboard.md). |
| **Shipyard** (`sailor sandbox`) | A simulation sandbox that forks the real chains onto your own machine with fake money, against the real deployed contracts, so you can rehearse the whole setup and prove a mandate permits what you think it permits. Real market state, frozen at fork time; fully isolated from live. Needs Foundry. See [Shipyard](shipyard.md). |
| **Skills** | **22** curated procedures under `.agents/skills/`, organized by the five stations — onboarding and diagnostics, strategy definition, mandate construction (one skill per shared template plus the full custom-permission lifecycle), agent construction with a verified code skeleton, and unattended operation through exit. The skills *are* the harness: any coding agent reads them natively and follows the same verified path in every project. See [Skills](skills.md). |

## Install

Two ways — both scaffold the same project. Full detail: [npm package](packages.md) · [Docker](docker.md).

{% tabs %}
{% tab title="npm" %}
```bash
npx @sail.money/sailor init my-agent && cd my-agent && npm install
```

Requires Node.js ≥ 18. Then open the folder in your coding agent and say **start**.
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

## Chains

The SDK bundles verified deployments for **12 chains** — mainnets Ethereum (1), Base (8453), Arbitrum (42161), Optimism (10), Unichain (130), BSC (56), World Chain (480), HyperEVM (999), MegaETH (4326), Robinhood (4663); testnets Base Sepolia (84532) and Ethereum Sepolia (11155111). Every core contract sits at the same address on every chain via CREATE2, and the seven shared permission templates are deployed and registered on all of them. Query it with `sailor chains` or `getSailDeployment(chainId)`; the canonical record is [Protocol → Deployment addresses](../protocol/reference/addresses.md).

## Community

* **Discord** — [discord.gg/9GsxPsHzRv](https://discord.gg/9GsxPsHzRv)
* **X** — [@SaildotMoney](https://x.com/SaildotMoney)
* **GitHub** — [github.com/sail-money](https://github.com/sail-money)
* **npm** — [@sail.money/sailor](https://www.npmjs.com/package/@sail.money/sailor)

## Where to go next

* [Quickstart](getting-started/quickstart.md) — install, and go from zero to a dispatched transaction.
* [Operate Sailor with a coding agent](getting-started/coding-agent.md) — the flagship workflow.
* [Skills](skills.md) · [npm package](packages.md) · [Docker](docker.md) · [Dashboard](dashboard.md) · [Shipyard](shipyard.md)
* [Concepts](concepts/) · [Guides](guides/) · [CLI reference](cli/) · [SDK reference](sdk/) · [Security](security.md) · [Troubleshooting](troubleshooting.md)

{% hint style="warning" %}
The Sail Protocol trusted core and its shared templates **as they stood at the review** were reviewed by [Octane](https://www.octane.security), an AI source-code security scanner, across three analyses; the final analysis found no critical- or high-severity findings. The later `WithdrawPermission` v2 rewrite is **not** covered by it. That review covers the protocol contracts — **not** this harness. A security review is not a guarantee of correctness — do not operate with funds you are not prepared to lose. See [Security](security.md).
{% endhint %}