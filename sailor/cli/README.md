# CLI reference

`sailor` is the operator command surface. Install it with the [package](../packages.md) and run via `npx sailor <command>`, or globally:

```bash
npm install -g @sail.money/sailor
sailor --help
sailor --version
```

Every command supports `--help`; most support `--json` for machine-readable output. The commands below are grouped by workflow and verified against the Sailor source.

## Conventions

* **`--json`** — almost every command accepts `--json` for machine-readable output. Use it in scripts, CI, and when [operating via a coding agent](../getting-started/coding-agent.md).
* **Read-only vs. gas** — `capabilities`, `chains`, `doctor`, `status`, `scan`, and `mandate simulate` spend no gas. Commands that change on-chain state route owner signatures through the browser [signing station](../concepts/keys-and-custody.md).
* **`SAIL_PASSPHRASE`** — unlocks the encrypted manager key non-interactively (CI/headless). Read from `.sail/.env.local` or the environment; never commit it.
* **RPC resolution** — `.sail/.env.local` chain-specific var → generic `RPC_URL` → shell env. See [Multi-chain operation](../guides/multi-chain.md).

## Project setup

| Command | What it does |
| --- | --- |
| `sailor init [dir]` | Scaffold a new agent project (`--template <name>`, `--chain <id>`, `--rpc-url <url>`, `--force` to re-init). |
| `sailor update` | Re-sync agent tooling files (skills, `AGENTS.md`, `Dockerfile`) from the latest template — your code and state are untouched. |

## Keys and owner

| Command | What it does |
| --- | --- |
| `sailor keys generate` | Generate + encrypt a key (`--type agent-wallet` or `mandate-signer`; `--passphrase`, else `SAIL_PASSPHRASE`, else prompt; `--force`). |
| `sailor keys show` | Addresses of stored keys. |
| `sailor keys export-ci` | Export key material for CI use. |
| `sailor owner connect` | Open the signing station, wait for your wallet, save it as owner (`--timeout <seconds>`). |
| `sailor owner show` | Show the saved project owner. |

## SMA lifecycle

| Command | What it does |
| --- | --- |
| `sailor account predict` | Deterministic SMA address before deploying (`--owner`, `--salt`, `--chain`). |
| `sailor onboard` | Set up an SMA end to end (`--new-sma` to create, `--sma <address>` to reuse, `--template <kindOrAddress>` to register a permission, `--skip-mandate`, `--salt <n>`). |
| `sailor account deploy-chain` | Deploy the same SMA address on an additional chain (same owner/manager/salt). |
| `sailor account rotate-signer` | Rotate the delegated agent wallet and re-approve mandates (`--to`, `--generate`, `--skip-reattach`, `--reattach-only`, `--list`). |
| `sailor scan` | Discover the owner's SMAs, permissions, and local keys (`--owner <address>`). |
| `sailor status` | Current account, permission, and session status. |

## Mandate lifecycle

| Command | What it does |
| --- | --- |
| `sailor mandate templates` | How to author your own permission + any community-deployed addresses. |
| `sailor mandate deploy` | Deploy a Foundry-compiled permission via the signing UI (`--contract <Name>` or `--artifact <path>`, `--args`/`--args-file`, `--build`, `--attach --sma <address>`). |
| `sailor mandate attach` | Register already-deployed permission(s) on an SMA — a comma-separated list is one signature (`--label`). |
| `sailor mandate configure` | Configure a shared template's per-account bounds (`--template <name> --args-file <path>` or `--params <hex>`; `--simulate-only` for a gas-free preflight; `--force`). |
| `sailor mandate simulate` | Probe a permission's `evaluate()` off-chain — no gas, no signing (`--target/--calldata/--value/--expect/--label`, or `--calls <file>` for a batch). |
| `sailor mandate sign` | Review and confirm the permissions authorized for your SMA (`--yes` for CI). |
| `sailor mandate prepare` | Prepare a mandate draft for review/signing in the UI. |
| `sailor mandate revoke` | Revoke permission(s) — owner-authorized (`--address <permissionOrName>` or `--all`). |
| `sailor mandate list` | Permissions deployed from this project. |
| `sailor mandate update` | Update tracked-permission metadata (`--name`, `--source-path`, `--artifact-path`). |
| `sailor mandate deploy-clone` | Deploy + register a standalone clone permission — currently unavailable (no clone templates deployed); use `mandate deploy`. |

## Signing station

| Command | What it does |
| --- | --- |
| `sailor station start` | Start the persistent browser-signing daemon (blocks — run in the background). |
| `sailor station status` / `stop` | Inspect / stop it. |

## Run and automate

| Command | What it does |
| --- | --- |
| `sailor run` | The agent execution loop (`--once` for a single tick, `--chain <id>`). |
| `sailor service install` | Install the agent as an OS service that restarts on crash — launchd / systemd / Task Scheduler (`--interval <s>`, `--project <path>`, `--chain <id>`). |
| `sailor service status` / `stop` / `uninstall` / `logs` | Manage the installed service. |
| `sailor trigger github` | Fire the scaffold's GitHub Actions agent workflow on demand (`--workflow`, `--ref`, `--reason`, `--repo`). |
| `sailor session pause` / `resume` | Instantly revoke / restore the agent's dispatch rights — Safe custody untouched. |

## Dashboard

| Command | What it does |
| --- | --- |
| `sailor ui start` | Local dashboard (per-project port in 3333–3999; `--expose tailscale` serves it HTTPS on your tailnet — never public). |
| `sailor ui stop` / `status` | Stop / inspect it. See [Dashboard](../dashboard.md). |

## Diagnostics

| Command | What it does |
| --- | --- |
| `sailor doctor` | Kernel health, dispatch model, RPC reachability, gas balances (`--account <address>`). |
| `sailor capabilities` | What you can build on this chain — read-only, no gas. |
| `sailor chains` | Supported chains + kernel addresses (`--verify` checks each via `eth_getCode`). |