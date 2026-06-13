# CLI reference

`sailor` is the operator command surface — "Operator toolkit for Sail Protocol." Install it with the package and run via `npx sailor <command>`, or globally:

```bash
npm install -g @sail.money/sailor
sailor --help
sailor --version
```

These pages document every command verified against the Sailor source, grouped by task:

* [Setup & onboarding](setup.md) — `init`, `owner`, `station`, `scan`, `onboard`
* [Accounts & keys](accounts.md) — `keys`, `account`
* [Mandates](mandate.md) — `mandate *` (deploy, attach, simulate, revoke, …) and the `--args` format
* [Run & operate](operate.md) — `run`, `session`, `status`, `doctor`, `capabilities`, `chains`, `ui`

## Conventions

* **`--json`** — almost every command accepts `--json` for machine-readable output. Use it in scripts, CI, and when [operating via a coding agent](../getting-started/coding-agent.md).
* **Read-only vs. gas** — `capabilities`, `chains`, `doctor`, `status`, `scan`, and `mandate simulate` spend no gas. Commands that change on-chain state route owner signatures through the browser [signing station](../concepts/keys-and-custody.md).
* **`SAIL_PASSPHRASE`** — unlocks the encrypted manager key non-interactively (CI/headless). Read from `.sail/.env.local` or the environment; never commit it.
* **RPC resolution** — `.sail/.env.local` chain-specific var → generic `RPC_URL` → shell env. See [Multi-chain operation](../guides/multi-chain.md).

## Command tree

```
sailor
├── init [dir]                       scaffold a new agent project
├── keys
│   ├── generate                     create + encrypt the agent / signer key
│   ├── show                         show stored key addresses
│   └── export-ci                    copy encrypted keystore to ci-keystore.json
├── account
│   ├── predict                      compute the deterministic SMA address (no gas)
│   ├── deploy-chain                 deploy the same SMA address on another chain
│   └── rotate-signer                rotate the agent wallet + re-approve mandates
├── mandate
│   ├── prepare                      prepare a mandate draft for UI signing
│   ├── sign                         review + confirm authorized permissions
│   ├── deploy                       deploy a Foundry permission (optionally --attach)
│   ├── attach                       register an already-deployed permission
│   ├── deploy-clone                 deploy + register a standalone clone permission
│   ├── revoke                       revoke permission(s) (or --all)
│   ├── templates                    how to author permissions + community addresses
│   ├── simulate                     probe a permission off-chain (PASS/FAIL/REVERT)
│   ├── update                       update tracking metadata for a permission
│   └── list                         list permissions deployed from this project
├── onboard                          create an SMA, register a permission, verify
├── station {start|status|stop}      the browser signing daemon
├── owner {connect|show}             detect + persist the project owner
├── scan                             discover SMAs, permissions, keys → context.json
├── status                           current account / permission / session status
├── run                              run the agent loop (--once for one tick)
├── session {pause|resume}           control the agent session
├── doctor                           read-only preflight (kernel, health, RPC, gas)
├── capabilities                     feasibility map (chains, model, templates)
├── chains                           supported chains + kernel addresses
└── ui {start|stop|status}           the local dashboard
```
