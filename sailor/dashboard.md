# Dashboard (local UI)

`sailor ui` runs a **local web dashboard** for your project — onboarding, balances, mandate health, activity, and owner signing. It reads from the project's `.sail/` directory and talks to your RPC; there is **no hosted backend** and nothing is sent anywhere.

```bash
sailor ui start     # start the dashboard (prints its URL)
sailor ui status    # is it running, and where
sailor ui stop      # stop it
```

## What it shows

* **Onboarding** — a guided path for SMA deployment and first mandate, mirroring the CLI/skills flow.
* **Balances** — the SMA's holdings and the manager/owner signer balances.
* **Mandate health** — the permissions registered on the SMA and their configured bounds.
* **Activity** — the append-only `.sail/activity.jsonl` feed (dispatches, denials, collections).
* **Owner signing** — the browser **signing station**, where owner/permission-signer EIP-712 signatures happen in your wallet. Sailor never reads the owner key.

## Ports & exposure

Each project gets a **deterministic port in 3333–3999** derived from its path — read the URL `sailor ui start` prints, or `.sail/runtime/ui.json`; don't assume 3333. The signing station runs alongside it.

By default the dashboard binds to localhost only. To reach it from another device on your own network, `--expose tailscale` serves it over HTTPS on your tailnet — it is **never** exposed publicly:

```bash
sailor ui start --expose tailscale
```

{% hint style="info" %}
**Under Docker** the UI binds to a fixed **3334** inside the container (signing station **3141**); with `docker run -P` these map to random host ports — resolve them with `docker port agent 3334`. See [Docker → Dashboard access](docker.md#dashboard-access).
{% endhint %}