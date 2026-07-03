# Docker

Run Sailor from the pre-built [`sailmoney/sailor`](https://hub.docker.com/r/sailmoney/sailor) image — **no Node.js on the host**, an isolated environment, the same CLI. The image is built from the repo's `Dockerfile` (linux/amd64 + linux/arm64, published with SBOM and provenance attestations) and contains exactly the files npm publishes. Tags: `latest` and the pinned version (`1.3.0`).

## Start a project

```bash
mkdir my-agent && cd my-agent
docker run -d --name agent -P -v "${PWD}:/workspace" sailmoney/sailor
docker exec agent sailor init
```

* The container idles (`sleep infinity`) and exists to serve `docker exec agent sailor <command>`.
* `-v "${PWD}:/workspace"` mounts your project **on the host** — read and edit files with your normal editor or coding agent; only `sailor` commands need the `docker exec` prefix. `sailor init` detects the container (`SAILOR_INSTALL_MODE=docker`).
* Naming the container something else? Match it: `docker run --name myproject -e SAILOR_CONTAINER_NAME=myproject …`.

## Key handling

Keys are generated **inside the container** but written to `.sail/keys/` **on your host** via the mount — encrypted at rest (geth keystore v3), never baked into the image or its layers:

```bash
docker exec -it agent sailor keys generate --type agent-wallet
```

Use `-it` for interactive passphrase entry, or pass `-e SAIL_PASSPHRASE=…` at `docker run` time for headless use (env vars are visible to `docker inspect` — prefer interactive entry on shared hosts). The container runs as the unprivileged `node` user.

## Dashboard access

Inside the container the UI binds to **3334** (and the signing station to **3141**). With `-P`, Docker maps them to random host ports — resolve before opening the browser:

```bash
docker exec agent sailor ui start
docker port agent 3334
# → 0.0.0.0:49201  → open http://localhost:49201
```

Prefer fixed ports? Publish them explicitly instead of `-P`:

```bash
docker run -d --name agent -p 3334:3334 -p 3141:3141 -v "${PWD}:/workspace" sailmoney/sailor
```

## Headless / unattended operation

The agent loop is just another exec — schedule it with whatever supervises your containers:

```bash
docker exec agent sailor run --once     # one tick (cron-friendly)
docker exec -d agent sailor run         # detached loop inside the container
```

`sailor service install` targets host OS service managers and is **not** applicable inside the container — use your orchestrator's restart policy (`--restart unless-stopped`) plus either the detached loop or a host cron of `run --once`. See [Automate](guides/ci.md) for the full set of options.

## Lifecycle

```bash
docker stop agent     # stop; project files and state live on the host
docker start agent    # resume later
docker pull sailmoney/sailor && docker rm -f agent && docker run …   # upgrade, then `sailor update`
```