# The Agent interface

A Sailor agent is a small object: a name, a description, and a `tick()` that the runner calls on every scheduled execution. `tick()` returns the dispatches it made.

```ts
export type Agent = {
  name: string;
  description: string;
  tick(ctx: AgentContext): Promise<Dispatch[]>;
};
```

Export one as the default from your strategy module; `sailor run` imports and ticks it. Keep the financial bounds in the [permission](../guides/build-a-mandate.md), and keep timing/selection in `tick()` — see [on-chain vs off-chain](../concepts/on-chain-off-chain.md).

## AgentContext

Every `tick()` receives a fully-wired context:

```ts
type AgentContext = {
  safe: Address;            // the SMA address
  account: Address;         // alias of `safe`
  chainId: number;
  blockNumber: bigint;
  timestamp: number;        // unix seconds
  now: Date;                // wall-clock time of this tick
  client: ISailorClient;    // a ready SailorClient (see SailorClient)
  publicClient: PublicClient; // viem client for arbitrary reads (QuoterV2, custom views, multicall)
  manager: ILocalKeyring;   // the manager keyring used to sign dispatches
  log: (msg: string) => void; // console + appends to .sail/activity.jsonl
  data: Record<string, unknown>; // your own data slot (see below)
  read: {
    balance:   (token: Address | "native") => Promise<bigint>;
    allowance: (token: Address, owner: Address, spender: Address) => Promise<bigint>;
    decimals:  (token: Address) => Promise<number>;
  };
};
```

| Field | Use it for |
| --- | --- |
| `account` / `safe` | the SMA you operate; pass to `client.*` calls |
| `client` | high-level dispatch/strategy/mandate operations |
| `publicClient` | any on-chain read `ctx.read` doesn't cover |
| `manager` | signing — pass to `client.dispatch.*` / `client.strategy.*` |
| `read.balance / allowance / decimals` | quick SMA state reads (`decimals` is cached for the process) |
| `log` | activity logging that shows in the dashboard and `activity.jsonl` |
| `data` | your inputs (see below) |

### The `data` slot

Sailor bakes in **no** third-party data sources. `ctx.data` is an open slot for your own: populate it inside your agent, or seed it from a JSON file via the `SAILOR_DATA` environment variable. It defaults to an empty object. Use it for price feeds, signals, or any external input your strategy needs — you own that integration.

## A minimal tick

```ts
import type { Agent, AgentContext, Dispatch } from "@sail.money/sailor/sdk";

const agent: Agent = {
  name: "rebalance-guard",
  description: "Tops up WETH when the SMA's balance drops below a floor.",
  async tick(ctx: AgentContext): Promise<Dispatch[]> {
    const weth = await ctx.read.balance("0xWETH");
    if (weth >= 1_000_000_000_000_000_000n) return []; // ≥ 1 WETH, nothing to do
    const { swap } = await ctx.client.strategy.swap(
      ctx.account,
      { from: "0xUSDC", to: "0xWETH", amount: 50_000_000n, swapPermission: "0xSwapPermission" },
      ctx.manager,
    );
    ctx.log(`topped up WETH via ${swap.txHash}`);
    return [swap];
  },
};

export default agent;
```

Return the `Dispatch[]` you executed (or `[]` for a no-op tick). Anything outside the mandate is rejected on-chain — see [Run a strategy & dispatch](../guides/run-a-strategy.md) for what a denial looks like.
