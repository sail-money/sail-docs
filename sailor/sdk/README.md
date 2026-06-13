# SDK reference

The Sailor SDK is the TypeScript library underneath the CLI: a high-level `SailorClient`, the `Agent` interface your strategy implements, EIP-712 signing helpers, kernel-capability detection, the contract ABIs, and the deployment + chain registries. It peer-depends on `viem ^2`.

* [SailorClient](client.md) — the full client and its namespaces (`account`, `mandate`, `dispatch`, `strategy`, `session`, `fees`, `principal`).
* [The Agent interface](agent.md) — `Agent` and `AgentContext`: what you implement and what each `tick()` receives.
* [Exports & helpers](reference.md) — the exported functions, types, and ABIs (signing, capability detection, errors, Safe-address math, fees).

## Install & import

The SDK ships **inside** the `@sail.money/sailor` package and is exposed via a subpath export. In an agent project scaffolded by `sailor init`, it's already a dependency:

```ts
import {
  SailorClient,
  buildDispatchSignature,
  detectKernelCapabilities,
  LocalKeyring,
} from "@sail.money/sailor/sdk";
import type { Agent, AgentContext, Dispatch } from "@sail.money/sailor/sdk";
```

To add it to another project:

```bash
npm install @sail.money/sailor viem
```

{% hint style="info" %}
**On the standalone SDK package.** The SDK is also published separately as `@sail.money/sdk` for consumers who want it independent of the CLI (`npm install @sail.money/sdk viem`). The **supported, verified-from-source** import path is the subpath export `@sail.money/sailor/sdk` shown above; if you depend on the standalone `@sail.money/sdk`, confirm the current published version on npm — see the [flag list](../../#) note in the Sailor build report. Either way, `@sail.money/sailor/sdk` imports work unchanged.
{% endhint %}

## How to use it

There are two layers, and you'll usually use both:

1. **`SailorClient`** — a batteries-included client with namespaces for accounts, mandates, dispatch, a swap strategy, sessions, fees, and principal tracking. Read-only methods need only an RPC; state-changing methods take a signer (the manager `LocalKeyring`). Start here. See [SailorClient](client.md).
2. **The `Agent` interface** — when you run under `sailor run`, you implement `Agent.tick(ctx)` and the runner provides an `AgentContext` (with a ready `SailorClient`, a viem `publicClient`, the manager keyring, balance/allowance helpers, and a logger). See [The Agent interface](agent.md).

Below those sit the primitives — `buildDispatchSignature` (self-detecting EIP-712 dispatch signer), `detectKernelCapabilities` (reads the on-chain dispatch model so you never hardcode it), `LocalKeyring` (the encrypted manager key), the kernel/factory/governance ABIs, and the deployment + chain registries. See [Exports & helpers](reference.md).

{% hint style="info" %}
Always sign dispatches with `buildDispatchSignature` and detect the model with `detectKernelCapabilities` — never hand-roll the EIP-712 struct or hardcode conjunctive vs. selective. The builder reads the kernel's on-chain typehash and selects the correct struct, so you cannot sign the wrong model.
{% endhint %}
