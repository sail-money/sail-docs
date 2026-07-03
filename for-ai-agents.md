<!-- LAUNCH CHECKLIST: when docs.sail.money is mapped, replace "sail-1.gitbook.io/sailmoney" with "docs.sail.money" in this file — the copy-prompt and both llms.txt URLs (clickable absolute links) are hard-coded here and must be swapped. -->

# For AI agents

Sail's docs are built to be read by machines as much as by people. Sailor is operated **through** coding agents, so pointing your assistant at these docs is a first-class workflow — not an afterthought.

## Ask your agent

Paste this into Claude Code, Cursor, Codex, ChatGPT, or any coding agent to get it up to speed and building:

```
Read https://sail-1.gitbook.io/sailmoney/llms-full.txt and explore the contents.
Then summarize what Sail is, how it works, and how a developer uses Sailor to
build and run a bounded, agent-managed account (SMA). When I confirm, install
Sailor (npm i @sail.money/sailor && npx sailor init) and walk me through
deploying an SMA and authoring a bounded mandate.
```

{% hint style="info" %}
This is a plain code block — use its built-in copy button. If your GitBook reader shows page-level **Copy as Markdown / Open in ChatGPT / Open in Claude** actions, those work too; nothing extra to install.
{% endhint %}

## Machine-readable context (llms.txt)

The docs publish structured static context at the site root, following the `llms.txt` convention:

* [**llms.txt**](https://sail-1.gitbook.io/sailmoney/llms.txt) — a structured index of every page, with links.
* [**llms-full.txt**](https://sail-1.gitbook.io/sailmoney/llms-full.txt) — the full expanded context, every page concatenated.

Point your agent at `llms.txt` for a map of the docs, or `llms-full.txt` to load everything at once.

## Understand vs. operate

The docs and the Sailor package do different jobs — you use them together:

* The **docs** (`llms.txt` / `llms-full.txt`) are how an agent **understands** Sail — it reads the documentation.
* The **Sailor package** (`npm i @sail.money/sailor`, or the [Docker image](sailor/docker.md)) is how an agent **operates** Sail — deploying SMAs, signing mandates, and dispatching.

> **Point your agent at the docs so it understands Sail, then install [Sailor](sailor/getting-started/README.md) (`npm i @sail.money/sailor`) so it can operate Sail.**

A typical first instruction:

> *"Read the Sail docs' llms-full.txt, then set up a Sail SMA on Base that only lets the agent swap USDC↔WETH on Uniswap V3 up to 500 USDC per trade."*

The assistant reads the relevant pages, installs Sailor, scaffolds the project, authors a bounded permission, simulates it, and runs.

New here? Start with the [Sailor overview](sailor/README.md) and [Operate Sailor with a coding agent](sailor/getting-started/coding-agent.md).