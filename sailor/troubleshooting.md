# Troubleshooting & FAQ

Common issues when operating with Sailor, and what they mean. Most "failures" are the system working — a denied dispatch means your bounds held.

## Dispatches

**My dispatch reverts with `PermissionDenied`.**
The named permission evaluated the call and returned false (or reverted) — the call is outside the mandate's bounds. This is fail-closed behavior, not a bug. [Simulate](guides/simulate.md) the exact call (`sailor mandate simulate`) to see PASS/FAIL/REVERT, then either fix the call or widen the permission deliberately. Common causes: amount over the cap, wrong router/target, wrong recipient, or a selector the permission doesn't handle.

**`PermissionNotRegistered`.**
You named a permission address that isn't on the SMA's mandate. Check `sailor status` / `sailor mandate list`, and confirm you're on the right chain — permissions are [per-chain](guides/multi-chain.md).

**`SessionInactive`.**
The session is paused. Run `sailor session resume`. (Pausing is the intended kill switch — `sailor session pause` — and doesn't touch custody.)

**`InvalidManagerSignature`, but the call looks correct.**
Usually a **lagging RPC node** in a load-balanced pool: `eth_estimateGas` or the nonce read hit a node behind the chain tip, producing a stale-nonce signature. Mitigations (in the SDK `DispatchOptions`): pass an explicit `gas` to skip the estimate pre-flight, use `awaitNonce` to wait for the bumped nonce, or set `nonce` explicitly. Back-to-back `dispatch.single` calls already track the nonce automatically. A dedicated RPC endpoint avoids it entirely.

**My swap reverts with `CumulativeSlippageTooHigh`.**
The aggregator's default slippage is too tight for a small trade. `client.strategy.swap` defaults `slippage` to `0.03` (3%) for this reason; raise it for very small or illiquid trades.

## Mandates & permissions

**My agent can swap but can't `approve` the router.**
An ERC-20 `approve()` is **not** covered by a swap/supply/deposit permission. Authorize it explicitly — either a separate per-call `IPermission` for the approve, or an atomic [`IBatchPermission`](../protocol/architecture/dispatch.md) covering the whole `[approve, action, reset]` sequence. A normal `IPermission` cannot authorize a batch. See [Build & register a mandate](guides/build-a-mandate.md).

**`mandate deploy --args` fails to parse.**
It's almost always shell quoting. On bash/zsh single-quote the whole JSON array; on **PowerShell use `--args-file`** instead of inline JSON. Numbers and addresses are strings; address arrays are nested arrays; order matches the constructor. See [the `--args` format](cli/mandate.md#the-args-format).

**My permission compiles and tests pass, but should I register it?**
Only after `forge test` **and** `sailor mandate simulate` both pass against samples derived from your real strategy — include the calls it must allow *and* the calls it must reject. The shipped templates are [examples to verify and adapt](guides/configure-a-template.md), not audited drop-in contracts; **you** own the correctness of any permission you register (Protocol [limitations](../protocol/security/limitations.md)).

## Setup & keys

**Where does the owner sign? I don't want my owner key in the terminal.**
You don't — and you shouldn't. Owner/permission-signer signatures go through the browser [signing station](concepts/keys-and-custody.md): `sailor station start &`, then `sailor owner connect`. Sailor never reads the owner key.

**How do I run headlessly / in CI?**
Set `SAIL_PASSPHRASE` to unlock the encrypted manager key, commit the **encrypted** `ci-keystore.json` (via `sailor keys export-ci`), and use the scaffold's GitHub Actions workflow. Never commit the passphrase or a raw key. See [Automate with GitHub Actions](guides/ci.md).

**Which dashboard port?**
Each project gets a deterministic port in 3333–3999 derived from its path. Use the URL `sailor ui start` prints, or read `.sail/runtime/ui.json` — don't assume 3333.

## SDK

**How do I import the SDK?**
From the subpath export: `import { SailorClient } from "@sail.money/sailor/sdk"`. It ships inside `@sail.money/sailor` (peer-depends on `viem ^2`) — there is no separate `@sail.money/sdk` package, so install `@sail.money/sailor` and import from `/sdk`. See [SDK reference](sdk/).

**How do I know if the kernel is selective or conjunctive?**
Call `detectKernelCapabilities` (or `client.capabilities()`) — it reads the on-chain typehash. Never hardcode the model; sign dispatches with `buildDispatchSignature`, which picks the right struct for you.

## Still stuck?

Run `sailor doctor` for a read-only health check (kernel model, permission health, RPC reachability, gas balances). For protocol-level questions — kernel internals, the permission model, fees, governance — see the [Protocol docs](../protocol/). For security disclosure: **security@sail.money**.
