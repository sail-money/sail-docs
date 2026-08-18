# Quickstart

From nothing to a bounded agent dispatching its first transaction. The fastest path is assistant-driven (next page); this page shows the underlying commands so you know what's happening.

## Prerequisites

* Node.js 18+
* A wallet (MetaMask, Rabby, and others) for the **owner** signing
* An RPC URL for a [supported chain](../guides/multi-chain.md) — e.g. Ethereum, Base, Arbitrum, Robinhood, or a testnet (12 chains in all; see the full list)
* For authoring permissions: [Foundry](https://book.getfoundry.sh) (`forge`)

## 1. Scaffold a project

Install the package and scaffold — Sailor works with any agent, via **npm** or **Docker**.

**npm**

```bash
# scaffold in the current folder
npm i @sail.money/sailor ; npx sailor init

# or scaffold into a new folder
npx @sail.money/sailor init my-agent && cd my-agent && npm install
```

**Docker** (no local Node needed)

```bash
docker run -d --name agent -P -v "${PWD}:/workspace" sailmoney/sailor ; docker exec agent sailor init
```

`sailor init my-agent` scaffolds into a new `my-agent/` directory (omit the name to scaffold into the current directory). It writes your agent code (`src/`), a Foundry workspace for permission contracts (`contracts/`), a GitHub Actions cron job, and the operator guide (`AGENTS.md`) with its skills. Then open the folder in your coding agent and say **start**.

{% hint style="info" %}
**Recommended:** open the folder in Claude Code, Cursor, or Codex and say **"start"** — the scaffolded `AGENTS.md` and its skills drive the entire flow below for you. See [Operate Sailor with a coding agent](coding-agent.md).
{% endhint %}

## 2. Point at a chain

Set an RPC URL and chain in `.sail/.env.local`:

```bash
RPC_URL=https://your-endpoint
CHAIN_ID=8453
```

Sailor resolves RPCs from `.sail/.env.local` first (a chain-specific var like `BASE_RPC_URL`, then generic `RPC_URL`), then the shell environment. See [Multi-chain operation](../guides/multi-chain.md).

## 3. Generate the agent key and connect your wallet

```bash
sailor keys generate          # create + encrypt the manager (agent) wallet
sailor signer start &        # the browser signing daemon (owner signs here)
sailor owner connect          # open the printed URL, connect your wallet, persist it as owner
```

The **owner** key stays in your browser wallet and is never read by Sailor. The **manager** (agent) key is encrypted on disk at `.sail/keys/manager.json` (geth keystore v3).

## 4. Check feasibility, then deploy an SMA

```bash
sailor capabilities           # read-only: chains, kernel model, what you can build — no gas
sailor account predict        # compute the deterministic SMA address before deploying
sailor onboard --new-sma      # create the SMA and (optionally) attach a mandate
```

The SMA address is deterministic — the same owner, manager, and salt produce the [same address on every supported chain](../guides/deploy-sma.md).

## 5. Author, test, and register a mandate

Write a permission contract in the scaffolded Foundry workspace (or use an example template), then prove it before authorizing:

```bash
forge build
sailor mandate simulate --address MyPermission --sma 0xYourSMA   # off-chain PASS/FAIL/REVERT, no gas
sailor mandate deploy --contract MyPermission --attach --sma 0xYourSMA  # deploy + register via the signing UI
```

`mandate simulate` proves the permission accepts the calls you want and rejects the ones you don't, **before** you spend gas or authorize it on-chain. See [Simulate before going live](../guides/simulate.md).

**Optional: rehearse it first.** [Shipyard](../shipyard.md) forks the real chains onto your own machine with fake money, so you can take the whole journey (deploy, register, configure, run) without spending anything. It needs Foundry, and it keeps its own state entirely separate from `.sail/`. Start it with `sailor sandbox start`.

## 6. Run the agent

```bash
sailor run --once             # a single tick — confirm it works
sailor run                    # continuous
```

`sailor run` executes your agent's `tick()` on a schedule. Successful dispatches are appended to `.sail/activity.jsonl`; reverts are written to stderr. Pause instantly at any time:

```bash
sailor session pause          # revoke dispatch rights (custody untouched); session resume to restore
```

## Where to go next

* [Operate Sailor with a coding agent](coding-agent.md) — let your assistant run all of the above.
* [Run a strategy & dispatch](../guides/run-a-strategy.md) — write the agent `tick()`.
* [CLI reference](../cli/) — every command, flag, and default.
