# CLI — Setup & onboarding

Commands for scaffolding a project, connecting your wallet, and creating an SMA.

## `sailor init [dir]`

Scaffold a new Sail agent into the current directory (or a `[dir]` subdirectory).

| Option | Description |
| --- | --- |
| `--template <name>` | Template to scaffold from (default: `default`) |
| `--chain <id>` | Default EVM chain id written to `.sail/config.json` and `.env.example` |
| `--rpc-url <url>` | Default `RPC_URL` written to `.sail/.env.local` |

```bash
mkdir my-agent && cd my-agent && npm i @sail.money/sailor && npx sailor init
```

## `sailor owner`

Detect and persist the project owner (your connected wallet).

| Subcommand | Options | Description |
| --- | --- | --- |
| `owner connect` | `--timeout <seconds>` (default `300`), `--json` | Open the signing station, wait for your wallet, save it as owner |
| `owner show` | `--json` | Show the saved project owner |

## `sailor station`

Manage the persistent signing station (the browser signing daemon). Owner signatures happen here — the agent never holds the owner key.

| Subcommand | Options | Description |
| --- | --- | --- |
| `station start` | `--json` | Start the station and keep it running (blocks — run in the background) |
| `station status` | `--json` | Show whether a station is running for this project |
| `station stop` | `--json` | Stop the running station |

```bash
sailor station start &
sailor owner connect
```

## `sailor scan`

Discover the owner's SMAs, their permissions, and local keys; save to `context.json`.

| Option | Description |
| --- | --- |
| `--owner <address>` | Owner address to scan (defaults to the saved project owner) |
| `--json` | Machine-readable output |

## `sailor onboard`

Set up an SMA, register a permission, and confirm the agent is operational.

| Option | Description |
| --- | --- |
| `--sma <address>` | Use a specific SMA instead of prompting |
| `--new-sma` | Create a new SMA via `SailKernel` |
| `--salt <n>` | CREATE2 salt for the deterministic Safe address (default `0`; increment for subsequent SMAs) |
| `--template <kindOrAddress>` | Also register this permission (kind, label, or address) |
| `--skip-mandate` | Skip the permission-registration step |
| `--json` | Machine-readable output (implies non-interactive) |

```bash
sailor onboard --new-sma --salt 0
```

See [Deploy & predict an SMA](../guides/deploy-sma.md) for the full flow.
