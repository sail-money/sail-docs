# Run & operate

Running the agent and operating a live SMA.

## `sailor run`

Run the agent execution loop.

| Option | Description |
| --- | --- |
| `--once` | Run a single tick, then exit |
| `--chain <chainId>` | Chain ID to run on (overrides `CHAIN_ID` env and `.env.local`) |

```bash
sailor run --once          # confirm one tick works
sailor run                 # continuous
```

Successful dispatches append to `.sail/activity.jsonl`; reverts are written to stderr as `reverted: <txHash> (gas used: N)`. See [Run a strategy & dispatch](../guides/run-a-strategy.md).

## `sailor session`

Control the agent session — instant kill switch, no effect on custody.

| Subcommand | Description |
| --- | --- |
| `session pause` | Pause the agent session (revoke dispatch rights) |
| `session resume` | Resume a paused session |

## `sailor status`

Show the current account, permission, and session status. (No gas.)

## `sailor doctor`

Read-only preflight before spending gas: kernel model, permission health, RPC reachability, and gas balances.

| Option | Description |
| --- | --- |
| `--account <address>` | SMA to check (defaults to `.sail/account.json`) |
| `--json` | Machine-readable output |

## `sailor capabilities`

Feasibility map (read-only): chains, kernel model, mandate templates, and strategy primitives — what you can build on this chain, no gas.

| Option | Description |
| --- | --- |
| `--json` | Machine-readable output |

## `sailor chains`

List supported chains and their `SailKernel` deployment addresses.

| Option | Description |
| --- | --- |
| `--verify` | Verify each kernel is deployed via `eth_getCode` (one RPC call per chain) |
| `--json` | Machine-readable output |

## `sailor ui`

Manage the local Sailor dashboard — live account state, mandate health, signer balances, and recent activity, read from `.sail/` with no hosted backend.

| Subcommand | Description |
| --- | --- |
| `ui start` | Start the dashboard (bare `sailor ui` does the same) |
| `ui stop` | Stop the running dashboard |
| `ui status` | Show whether the dashboard is running |

Each project gets its own deterministic port in the 3333–3999 range (derived from the project path), so several dashboards can run side by side. Use the URL the command prints, or read it from `.sail/runtime/ui.json` — do not assume 3333.
