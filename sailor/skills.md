# Skills

**Skills are the procedures that make an agent safe to operate.** Every project `sailor init` scaffolds carries **seventeen** on-demand skills under `.agents/skills/`, following the open [Agent Skills](https://agentskills.io) standard: a slim, always-loaded `AGENTS.md` carries the project map and hard invariants, while the detailed procedures live in the skills, loaded on demand.

They exist so the safe order of operations is encoded **once** — register → configure → simulate → verify — instead of being re-derived by every agent. Skills are plain markdown; an agent that doesn't scan skills follows the routing table in `AGENTS.md` to the same files. They ship in every scaffold, not just this repo, alongside the [worked example permissions](guides/build-a-mandate.md) they teach from.

## The seventeen skills

They span the whole workflow:

### Setting up

| Skill | What it does |
| --- | --- |
| `sail-onboarding` | Walk a new (or partially set-up) project through SMA deployment, agent-wallet creation, address prediction, and multi-chain deployment. The entry point when you say "start" or "continue". |
| `sail-project-info` | Read-only commands and state files that answer "what's the state of…", "is X set up", "which chains", "what permissions are registered" — the diagnostics layer. |
| `sail-servers` | Start, stop, and health-check the two local servers — the dashboard and the browser signing station. |

### Defining the mandate

| Skill | What it does |
| --- | --- |
| `sail-templates` | The registry + reuse guide for Sail's shared permission templates — which primitives exist and how to gate an SMA by reusing a configurable singleton (no per-SMA deploy). |
| `sail-mandates` | The full custom-permission lifecycle — designing bounds, authoring Solidity `IPermission` contracts, Foundry testing, deploying, simulating, authorizing, and revoke/update/list. |
| **one skill per shared template** | See below — seven skills, one for each protocol template. |

### Executing strategy

| Skill | What it does |
| --- | --- |
| `sail-token-resolve` | Resolve tokens by symbol/address into on-chain metadata **and** a cross-chain, cross-DEX liquidity map (which chain and which venue actually hold liquidity). Run before building any swap/DCA/LP/lending mandate. Keyless, no gas. |
| `sail-swap-quote` | Fetch a live Uniswap V3 quote via QuoterV2 and compute the slippage-adjusted `amountOutMinimum` floor the agent embeds in every swap dispatch. |
| `sail-transactions` | How dispatches work — the selective dispatch model, signing, batching, permission resolution, running the agent, and why a transaction is denied or reverted. |

### Running unattended

| Skill | What it does |
| --- | --- |
| `sail-automation` | Run the agent unattended — four options by reliability and infra overhead: GitHub Actions runner, self-hosted runner, Docker on any VM, or a local daemon. Use after `sailor run --once` works. |
| `sail-extend` | Recipes for extending a live agent with notifications (Telegram, email) and a strategy-specific dashboard. |

## One skill per protocol template

Each of the protocol's [seven shared permission templates](../protocol/permissions/shared-templates.md) has its **own dedicated skill** — it encodes that template's exact parameter schema, the safe `register → configure → simulate → verify` sequence, and the per-template footguns, so an agent follows a vetted procedure instead of re-deriving it:

| Skill | Template | Gates |
| --- | --- | --- |
| `sail-template-swap` | `SwapPermission` | DEX swaps / DCA with router + token allowlists, per-tx cap, **mandatory** oracle slippage band |
| `sail-template-swap-no-oracle` | `SwapPermissionNoOracle` | Swaps for tokens with no oracle — allowlists + cap + live-pool sanity band (not manipulation-resistant) |
| `sail-template-borrow` | `BorrowPermission` | Bounded borrows (Aave/Morpho/Compound) with protocol + asset allowlist, cap, on-chain LTV check |
| `sail-template-deposit` | `DepositPermission` | Deposits into ERC-4626 vaults / Aave with target + token allowlist and a per-tx cap |
| `sail-template-withdraw` | `WithdrawPermission` | Withdrawals to **one** fixed recipient (typically the owner's Safe) |
| `sail-template-transfer` | `TransferPermission` | ERC-20 transfers within a per-tx cap to a recipient allowlist |
| `sail-template-approve-batch` | `ApproveAndCallBatchPermission` | Atomic approve → call → reset-to-zero batches with token/spender/target/selector allowlists |

Templates are **registered and configured through these skills** because the CLI provides the primitives (`sailor mandate attach` / `configure` / `simulate`) and the skill is the checklist that sequences them correctly. `sailor mandate attach` only **registers** a template — you must also **configure** the per-account bounds. See [Configure a shared template](guides/configure-a-template.md).

---

The skills in your scaffold (or in the repo under [`templates/default/.agents/skills/`](https://github.com/sail-money/Sailor/tree/main/templates/default/.agents/skills)) are the authoritative procedures; this page is the map. For the design rationale, see the repo's [templates-and-skills.md](https://github.com/sail-money/Sailor/blob/main/docs/templates-and-skills.md).