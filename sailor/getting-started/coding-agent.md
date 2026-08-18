# Operate Sailor with a coding agent

Sailor is designed to be operated **through a coding agent** — Claude Code, Cursor, Codex, or any AI coding assistant. You describe the strategy you want; the assistant deploys the SMA, authors and tests the permissions that bound it, signs the mandate, and runs the agent. This is the intended way to use Sailor, and it's what the scaffold is built for.

## How it works

When you run `sailor init`, the scaffold includes an **`AGENTS.md`** operator guide and a set of on-demand **skills** under `.agents/skills/`, following the open [Agent Skills](https://agentskills.io) standard. Assistants that scan skills load each one only when relevant; assistants that don't follow a routing table in `AGENTS.md` to the same plain-markdown files. It works in Claude Code, Cursor, Copilot, and Codex.

A representative slice of the scaffolded skills, by station (the full set of **22** — including one per shared template — is on the [Skills](../skills.md) page):

| Skill | Station / role |
| --- | --- |
| `sailor-onboarding` | **Arrive** — set up a new project, or resume a partial one |
| `sailor-strategy` | **Strategy** — turn your intent into a concrete spec at `.sail/strategy.md` |
| `sailor-mandate-planner` + `sailor-templates` + `sailor-template-*` + `sailor-mandates` | **Mandate** — route the spec to shared templates (one skill per template) or author custom permissions |
| `sailor-agent-build` + `sailor-transactions` + `sailor-memory` | **Agent** — build the tick loop, dispatch mechanics, chain-reconciled memory |
| `sailor-automation` + `sailor-operate` + `sailor-extend` | **Sail** — run unattended, operate/tune/exit, optional notifications/dashboards |
| `sailor-project-info` / `sailor-servers` / `sailor-token-resolve` / `sailor-swap-quote` | Anytime utilities — state, local servers, token/liquidity resolution, swap quotes |

## The flow

```bash
# scaffold in the current folder
npm i @sail.money/sailor ; npx sailor init

# or scaffold into a new folder
npx @sail.money/sailor init my-agent && cd my-agent && npm install
```

Open the folder in your assistant and say **start**. From there the assistant:

1. **Deploys your SMA** and creates your agent wallet.
2. **Defines your strategy** — it treats `src/` as a blank slate and asks what you want; it does not assume the example code is your strategy.
3. **Builds, tests, and signs your mandate** — authoring permission contracts in the Foundry workspace, running `forge test` and `sailor mandate simulate`, and only then authorizing on-chain.
4. **Runs your agent** — locally with `sailor run`, or on a schedule via the bundled GitHub Actions workflow.
5. **Extends** — notifications, a custom dashboard.

## What the agent is told to do (and not do)

The scaffold's `AGENTS.md` encodes hard invariants the assistant follows. The ones worth knowing as the operator:

* **Owner signing is browser-only.** The assistant never puts your owner key in the terminal — owner approvals happen in the signing-server UI in your browser.
* **Setup asks before spending gas; a running agent does not.** Once the mandate is signed, *the mandate is the authorization* — the agent transacts autonomously within it. You are not asked to confirm each dispatch.
* **Never authorize a permission before it passes tests.** The assistant must see `forge test` **and** `sailor mandate simulate` pass against samples derived from your strategy before attaching a permission.
* **Use the SDK's signing helpers.** It signs dispatches with `buildDispatchSignature` and detects the kernel's dispatch model with `detectKernelCapabilities` — never hand-rolled EIP-712, never a hardcoded model.
* **Example permissions are not a menu.** The assistant treats shipped templates as [examples to adapt and verify](../guides/configure-a-template.md), not audited, drop-in production contracts.
* **`approve()` needs explicit coverage.** An ERC-20 `approve` is not covered by a swap/supply/deposit permission — it's bounded either per-call (separate single dispatches) or as an atomic batch via an `IBatchPermission`. See [Build & register a mandate](../guides/build-a-mandate.md).

## Pointing your agent at these docs

Coding agents read these docs on your behalf. The simplest path: give your agent the ready-made prompt on [For AI agents](../../for-ai-agents.md), which points it at the docs' `llms-full.txt` (the full docs as one machine-readable file) and tells it what to do next.

A typical instruction: *"Read the Sail docs' llms.txt, then set up a Sail SMA on Base that lets the agent only swap USDC↔WETH on Uniswap V3 up to 500 USDC per trade."* The agent pulls the relevant pages, scaffolds, authors a bounded permission, simulates it, and runs.

The custody guarantee holds regardless of which assistant you use: capital stays in your Safe, the mandate is enforced on-chain on every dispatch, and you can [pause](../cli/) or revoke at any time.
