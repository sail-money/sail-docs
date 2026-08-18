# npm package

Sailor ships as a single published package — [`@sail.money/sailor`](https://www.npmjs.com/package/@sail.money/sailor) (MIT). It contains **both** the `sailor` CLI and the SDK; the SDK is exposed as a subpath export. There is **no separate `@sail.money/sdk` package** — `@sail.money/sailor` is the one package you install.

## Install & scaffold

{% tabs %}
{% tab title="bash / zsh (macOS, Linux)" %}
```bash
# scaffold in the current folder
npm i @sail.money/sailor ; npx sailor init

# or scaffold into a new folder
npx @sail.money/sailor init my-agent && cd my-agent && npm install
```
{% endtab %}

{% tab title="PowerShell (Windows)" %}
```powershell
# scaffold in the current folder
npm i @sail.money/sailor ; npx sailor init

# or scaffold into a new folder
npx @sail.money/sailor init my-agent ; cd my-agent ; npm install
```
{% endtab %}
{% endtabs %}

Requires **Node.js ≥ 18**. `sailor init` scaffolds the project from `scaffold/` (agent code in `src/`, a Foundry workspace for custom permissions in `contracts/`, `AGENTS.md`, and the [skills](skills.md)). Then open the folder in your coding agent and say **start**.

## Running the CLI

Inside a scaffolded project the `sailor` binary is available via `npx`:

```bash
npx sailor <command>      # e.g. npx sailor status, npx sailor run --once
```

Prefer a global command instead:

```bash
npm install -g @sail.money/sailor
sailor <command>
```

The full command surface is in the [CLI reference](cli/).

## Using the SDK

The SDK is imported from the **`@sail.money/sailor/sdk`** subpath — this is what scaffolded agent code uses, and it's injected as a dependency by `sailor init`:

```ts
import {
  SailorClient,
  LocalKeyring,
  getSailDeployment,
} from "@sail.money/sailor/sdk";
import type { Agent, AgentContext, Dispatch } from "@sail.money/sailor/sdk";
```

To add it to another project, install the package and its `viem` peer:

```bash
npm install @sail.money/sailor viem
```

Everything — `SailorClient`, the `Agent` interface, EIP-712 builders, template encoders, ABIs, and the deployment/chain registries — imports from that single `@sail.money/sailor/sdk` entry point. See the [SDK reference](sdk/).

{% hint style="info" %}
**One package, no standalone SDK.** Always import the SDK from `@sail.money/sailor/sdk`. A standalone `@sail.money/sdk` distribution with granular subpaths is planned but **not yet published to npm** — do not depend on it; install `@sail.money/sailor`.
{% endhint %}

## No Node.js?

Run the same CLI from the pre-built container instead — see [Docker](docker.md).