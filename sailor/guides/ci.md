# Automate & run unattended

Once `sailor run --once` works, you can run the agent on a schedule or as a long-lived loop. The scaffold's `sailor-automation` skill offers **four options**, by reliability and infra overhead:

1. **GitHub Actions** (cloud runner, zero infra) — the scaffold's `.github/workflows/agent-tick.yml` runs `sailor run --once` on a cron; `sailor trigger github` fires it on demand. Simplest, but cron timing drifts.
2. **Self-hosted runner** — the same workflow on your own machine for reliable timing.
3. **Docker** — the `sailmoney/sailor` image on any VM or cloud, via a container registry (see [Docker](../docker.md)).
4. **Local daemon** — `sailor service install` registers an OS service (launchd / systemd / Task Scheduler) that restarts on crash; `sailor service status`/`stop`/`logs`/`uninstall` manage it. No Docker required.

The rest of this page details option 1 (GitHub Actions), the zero-infra default.

## GitHub Actions — one-time setup

**1. Export the CI keystore.**

```bash
sailor keys export-ci
```

This copies the **encrypted** agent-wallet keystore to `ci-keystore.json` in the project root and allowlists it in `.gitignore`. The geth v3 keystore is safe to commit — the raw private key is never exposed; it can only be unlocked with the passphrase.

**2. Commit the files the runner needs.**

```
ci-keystore.json
.sail/account.json
.sail/mandate.json
```

**3. Add two repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Value |
| --- | --- |
| `SAIL_PASSPHRASE` | the passphrase that encrypts the agent wallet |
| `RPC_URL` | your RPC endpoint for the agent's chain |

## How the workflow runs

On each scheduled tick the workflow copies `ci-keystore.json` to `.sail/keys/manager.json`, then runs `npx sailor run --once` with `SAIL_PASSPHRASE` set so the manager key is unlocked non-interactively. **No private key ever appears in the workflow file or in the secrets** — only the passphrase and RPC URL do, and the keystore is encrypted.

```yaml
# .github/workflows/agent-tick.yml (provided by the scaffold) runs, roughly:
#   - npm ci
#   - cp ci-keystore.json .sail/keys/manager.json
#   - npx sailor run --once     # env: SAIL_PASSPHRASE, RPC_URL
```

Fire it manually without waiting for the cron:

```bash
sailor trigger github --reason "manual tick"
```

## Safety notes

* The agent in CI is still bounded by the on-chain mandate — CI cannot make it exceed its permissions.
* You can [pause](../cli/) the session at any time (`sailor session pause`); a paused session makes every scheduled tick a no-op until you resume.
* Never commit `SAIL_PASSPHRASE` or any raw private key. Only the **encrypted** `ci-keystore.json` is committed.

The `sailor-automation` skill walks through all four options if you're [operating via a coding agent](../getting-started/coding-agent.md).