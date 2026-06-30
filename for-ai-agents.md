<!-- LAUNCH CHECKLIST: when docs.sail.money is mapped, replace "sail-1.gitbook.io/sailmoney" with "docs.sail.money" in this file — the MCP endpoint URL and both llms.txt URLs are absolute and must be swapped here. -->

# For AI agents

Sail's docs are built to be read by machines as much as by people. Sailor is operated **through** coding agents, so pointing your assistant at these docs is a first-class workflow — not an afterthought. Two ways, strongest first.

## Query the docs live (MCP)

This documentation site is a live **MCP server**. A coding agent can connect to it and **query the docs on demand while it works** — searching pages and pulling exact CLI flags, SDK signatures, and the permission model, always current, with no copy-paste.

**Endpoint**

```
https://sail-1.gitbook.io/sailmoney/~gitbook/mcp
```

**Claude Code (CLI)**

```bash
claude mcp add gitbook-documentation --scope user --transport http https://sail-1.gitbook.io/sailmoney/~gitbook/mcp
```

**Claude (Chat / Cowork)** — add a **custom connector** pointing at the endpoint URL above.

**ChatGPT** and **VS Code** — also supported: add the same endpoint URL as an MCP / custom connector.

{% hint style="info" %}
**Why this matters for Sailor.** An agent building a Sailor integration can query these docs live — the exact `sailor` command flags, the SDK's `Agent` / `SailorClient` surface, and the on-chain permission model — instead of guessing or working from stale memory.
{% endhint %}

## Read the static context (llms.txt)

When a live connection isn't available, the docs also publish structured static context at the site root, following the `llms.txt` convention:

* **llms.txt** — a structured index of every page, with links: `https://sail-1.gitbook.io/sailmoney/llms.txt`
* **llms-full.txt** — the full expanded context, every page concatenated: `https://sail-1.gitbook.io/sailmoney/llms-full.txt`

Point your agent at `llms.txt` for a map of the docs, or `llms-full.txt` to load everything at once.

## Pointing your agent at Sail

Prefer **MCP** (live and queryable); fall back to **llms.txt** (a static snapshot). Then describe what you want in plain language — for example:

> *"Connect to the Sail docs MCP, then set up a Sail SMA on Base that only lets the agent swap USDC↔WETH on Uniswap V3 up to 500 USDC per trade."*

The assistant pulls the relevant pages, scaffolds with Sailor, authors a bounded permission, simulates it, and runs.

New here? Start with the [Sailor overview](sailor/README.md) and [Operate Sailor with a coding agent](sailor/getting-started/coding-agent.md).
