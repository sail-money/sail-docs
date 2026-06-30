<!-- LAUNCH CHECKLIST: when docs.sail.money is mapped, replace "sail-1.gitbook.io/sailmoney" with "docs.sail.money" in this file — the MCP endpoint URL and both llms.txt URLs (now clickable absolute links) are hard-coded here and must be swapped. -->

# For AI agents

Sail's docs are built to be read by machines as much as by people. Sailor is operated **through** coding agents, so pointing your assistant at these docs is a first-class workflow — not an afterthought. Two ways, strongest first.

## Query the docs live (MCP)

This documentation site is a live **MCP server**, and its endpoint works with **any MCP-compatible LLM or coding agent** — not just one vendor. Connect to it and your agent can **query the docs on demand while it works**: searching pages and pulling exact CLI flags, SDK signatures, and the permission model, always current, with no copy-paste.

**Endpoint**

```
https://sail-1.gitbook.io/sailmoney/~gitbook/mcp
```

Most MCP-capable assistants connect by adding this endpoint as a **custom connector / MCP server**. For example — **Claude Code (CLI)**:

```bash
claude mcp add gitbook-documentation --scope user --transport http https://sail-1.gitbook.io/sailmoney/~gitbook/mcp
```

**Claude (Chat / Cowork)** adds it as a custom connector; **ChatGPT, VS Code, Cursor,** and other MCP-compatible clients add the same endpoint URL as an MCP / custom connector. The endpoint is universal — any client that speaks MCP can use it.

{% hint style="info" %}
**Why this matters for Sailor.** An agent building a Sailor integration can query these docs live — the exact `sailor` command flags, the SDK's `Agent` / `SailorClient` surface, and the on-chain permission model — instead of guessing or working from stale memory.
{% endhint %}

## Read the static context (llms.txt)

When a live connection isn't available, the docs also publish structured static context at the site root, following the `llms.txt` convention:

* [**llms.txt**](https://sail-1.gitbook.io/sailmoney/llms.txt) — a structured index of every page, with links.
* [**llms-full.txt**](https://sail-1.gitbook.io/sailmoney/llms-full.txt) — the full expanded context, every page concatenated.

Point your agent at `llms.txt` for a map of the docs, or `llms-full.txt` to load everything at once.

## Pointing your agent at Sail

**MCP and the Sailor package do different jobs — you use them together, not as alternatives:**

* The **docs MCP endpoint** (and `llms.txt`) is how an agent **understands** Sail — it reads the documentation.
* The **Sailor package** (`npm i @sail.money/sailor`, or the Docker image) is how an agent **operates** Sail — deploying SMAs, signing mandates, and dispatching.

> **Point your agent at the docs (MCP or llms.txt) so it understands Sail, then install [Sailor](sailor/getting-started/README.md) (`npm i @sail.money/sailor`) so it can operate Sail.**

So: prefer **MCP** for docs access (live, queryable), with `llms.txt` as a static fallback; and install the Sailor package to actually do the work. A typical first instruction:

> *"Connect to the Sail docs MCP, then set up a Sail SMA on Base that only lets the agent swap USDC↔WETH on Uniswap V3 up to 500 USDC per trade."*

The assistant reads the relevant pages, installs Sailor, scaffolds the project, authors a bounded permission, simulates it, and runs.

New here? Start with the [Sailor overview](sailor/README.md) and [Operate Sailor with a coding agent](sailor/getting-started/coding-agent.md).
