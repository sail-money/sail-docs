# Run a strategy & dispatch

Your strategy is an [`Agent`](../sdk/agent.md): a `tick()` that runs on a schedule and returns the dispatches it wants to make. The kernel enforces the mandate on every one.

## Write the tick

```ts
import type { Agent, AgentContext, Dispatch } from "@sail.money/sailor/sdk";

const agent: Agent = {
  name: "dca-usdc-weth",
  description: "Buys WETH with USDC, capped per trade, once per tick.",
  async tick(ctx: AgentContext): Promise<Dispatch[]> {
    const usdc = await ctx.read.balance("0xUSDC");
    if (usdc < 100_000_000n) return [];                 // 100 USDC (6 decimals); skip if low
    const result = await ctx.client.strategy.swap(
      ctx.account,
      { from: "0xUSDC", to: "0xWETH", amount: 100_000_000n, swapPermission: "0xSwapPermission" },
      ctx.manager,
    );
    ctx.log(`bought WETH, swap tx ${result.swap.txHash}`);
    return [result.swap];
  },
};

export default agent;
```

`ctx` gives you the SMA address (`ctx.account` / `ctx.safe`), a `SailorClient` (`ctx.client`), a viem `publicClient`, the manager keyring (`ctx.manager`), `ctx.read.{balance, allowance, decimals}`, a `log()` that also appends to `.sail/activity.jsonl`, and a `ctx.data` slot for your own inputs (seed it from a JSON file via the `SAILOR_DATA` env var, or populate it in your agent — Sailor bakes in no third-party data sources). See [the Agent interface](../sdk/agent.md).

## Run it

```bash
sailor run --once                 # a single tick, then exit — confirm it works first
sailor run                        # continuous
sailor run --chain 8453           # override CHAIN_ID / .env.local for this run
```

Successful dispatches are appended to `.sail/activity.jsonl`; a reverted transaction is written to stderr as `reverted: <txHash> (gas used: N)`.

## What a denied dispatch looks like

If the agent tries something the mandate doesn't allow, the kernel reverts the dispatch — no state changes. The SDK decodes the kernel error so you see *why*:

| You'll see | Meaning |
| --- | --- |
| `PermissionNotRegistered` | the permission you named isn't on the SMA's mandate |
| `PermissionDenied` | the permission evaluated the call and returned false (out of bounds, wrong selector/target/amount) |
| `SessionInactive` | the session is paused — run `sailor session resume` |
| `InvalidManagerSignature` | wrong/stale manager signature (often a lagging RPC node; see [Troubleshooting](../troubleshooting.md)) |

This is the system working: a denied dispatch means your bounds held. Re-check the call against the permission, or [simulate](simulate.md) it to see PASS/FAIL/REVERT without spending gas.

{% hint style="info" %}
Don't hand-roll the dispatch signature. The SDK's `buildDispatchSignature` reads the kernel's on-chain typehash and signs the correct (selective vs conjunctive) struct automatically — you can't pass the wrong model. `sailor run` and `client.dispatch.*` use it for you.
{% endhint %}

## Pause and resume

```bash
sailor session pause              # revoke dispatch rights instantly (custody untouched)
sailor session resume             # re-enable
```

To automate ticks on a schedule without a long-running process, see [Automate with GitHub Actions](ci.md).
