# Skills

**Skills are the harness.** Every project `sailor init` scaffolds carries **22** on-demand skills under `.agents/skills/`, following the open [Agent Skills](https://agentskills.io) standard: a slim, always-loaded `AGENTS.md` carries the project map and hard invariants, while the detailed procedures live in the skills, loaded on demand. Any coding agent reads them natively and follows the same verified path in every project.

They exist so the safe order of operations is encoded **once** — register → configure → simulate → verify — instead of being re-derived by every agent. Skills are plain markdown; an agent that doesn't scan skills follows the routing table in `AGENTS.md` to the same files.

## The five stations

The skills are organized around the five-station journey `AGENTS.md` lays out (each station names its owning skill, entry gate, and exit check):

### 1. ARRIVE

| Skill | What it does |
| --- | --- |
| `sailor-onboarding` | Set up a new (or resume a partial) project — SMA deployment, agent-wallet creation, address prediction, multi-chain deployment. The entry point when you say "start" or "continue". |

### 2. STRATEGY

| Skill | What it does |
| --- | --- |
| `sailor-strategy` | The guided conversation that turns your intent ("DCA into ETH", "earn yield on USDC", "pay contributors weekly") into a complete, concrete spec at `.sail/strategy.md` — every later station reads it. |

### 3. MANDATE

| Skill | What it does |
| --- | --- |
| `sailor-mandate-planner` | Station-3 entry: route each action of the strategy spec to a shared template or to bespoke authoring. |
| `sailor-templates` | The registry + reuse guide — which primitives exist and the register → configure reuse flow. |
| `sailor-template-*` | **One skill per shared template** (seven — see below). |
| `sailor-mandates` | The full custom-`IPermission` lifecycle — designing bounds, authoring Solidity, Foundry testing, deploying, simulating, authorizing, revoke/update/list. |

### 4. AGENT

| Skill | What it does |
| --- | --- |
| `sailor-agent-build` | Build the agent's tick loop in `src/agent.ts` from the strategy spec and the registered mandate — from a typecheck-verified skeleton. |
| `sailor-transactions` | How dispatches work — the selective dispatch model, signing, batching, permission resolution, and why a transaction is denied or reverted. |
| `sailor-memory` | The agent's append-only, chain-reconciled memory ledger (`.sail/memory/ledger.jsonl`) so a fresh process recovers its own trading history. |

### 5. SAIL

| Skill | What it does |
| --- | --- |
| `sailor-automation` | Run the agent unattended — four options: GitHub Actions runner, self-hosted runner, Docker on any VM, or a local daemon. |
| `sailor-operate` | Operate a live agent — "what did it do", "why was it denied", pause, tune caps, widen/narrow the mandate, withdraw funds, exit. |
| `sailor-extend` | Optional: extend a live agent with notifications (Telegram, email) and a strategy-specific dashboard. |

### Anytime utilities (not tied to a station)

| Skill | What it does |
| --- | --- |
| `sailor-project-info` | Read-only state — "what's set up", "am I ready", preflight, which chains, what permissions are registered. |
| `sailor-servers` | Start / stop / health-check the two local servers — the dashboard and the signing server — plus Docker/remote access. |
| `sailor-token-resolve` | Resolve tokens by symbol/address into on-chain metadata **and** a cross-chain, cross-DEX liquidity map. Keyless, no gas. |
| `sailor-swap-quote` | Fetch a live Uniswap V3 quote and compute the slippage-adjusted `amountOutMinimum` floor the agent embeds in every swap. |

## One skill per protocol template

Each of the protocol's [seven shared permission templates](../protocol/permissions/shared-templates.md) has its **own dedicated skill** — it encodes that template's exact parameter schema, the safe `register → configure → simulate → verify` sequence, and the per-template footguns:

| Skill | Template | Gates |
| --- | --- | --- |
| `sailor-template-swap` | `SwapPermission` | Oracle-gated DEX swaps: router + token allowlists, per-tx cap, **mandatory** oracle slippage band (large trades) |
| `sailor-template-swap-no-oracle` | `SwapPermissionNoOracle` | The default bounded-swap tier: allowlists + cap + live-pool sanity band (not manipulation-resistant) |
| `sailor-template-borrow` | `BorrowPermission` | Bounded borrows (Aave/Morpho/Compound) with protocol + asset allowlist, cap, on-chain LTV check |
| `sailor-template-deposit` | `DepositPermission` | Deposits into ERC-4626 vaults / Aave with target + token allowlist and a per-tx cap |
| `sailor-template-withdraw` | `WithdrawPermission` | Withdrawals to **one** fixed recipient (typically your wallet) |
| `sailor-template-transfer` | `TransferPermission` | ERC-20 transfers within a per-tx cap to a recipient allowlist |
| `sailor-template-approve-batch` | `ApproveAndCallBatchPermission` | Atomic approve → call → reset-to-zero batches with token/spender/target/selector allowlists |

Templates are **registered and configured through these skills** because the CLI provides the primitives (`sailor mandate register` / `configure` / `simulate`) and the skill is the checklist that sequences them correctly. `sailor mandate register` only **registers** a template — you must also **configure** the per-account bounds. See [Configure a shared template](guides/configure-a-template.md).

---

The skills in your scaffold (or in the repo under [`scaffold/.agents/skills/`](https://github.com/sail-money/Sailor/tree/main/scaffold/.agents/skills)) are the authoritative procedures; this page is the map. For the design rationale, see the repo's [templates-and-skills.md](https://github.com/sail-money/Sailor/blob/main/docs/templates-and-skills.md).