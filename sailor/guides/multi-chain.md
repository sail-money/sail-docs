# Multi-chain operation

Sailor targets the chains where the Sail trusted core is deployed. Because the core uses [deterministic CREATE2 deployment](../../protocol/concepts/deterministic-deployment.md), the kernel — and your SMA — have the **same address on every supported chain**.

## Supported chains

| Chain | Chain ID |
| --- | --- |
| Ethereum | 1 |
| Base | 8453 |
| Arbitrum | 42161 |
| Unichain | 130 |
| Base Sepolia | 84532 |
| Eth Sepolia | 11155111 |

The verified deployment addresses are bundled in the package and exposed via `getSailDeployment(chainId)` in the SDK. The canonical address list is the Protocol's [Deployment addresses](../../protocol/reference/addresses.md). Inspect them from the CLI:

```bash
sailor chains            # list supported chains and their SailKernel addresses
sailor chains --verify   # confirm each kernel is deployed (one eth_getCode per chain)
sailor chains --json
```

## Configuring RPCs per chain

Sailor resolves an RPC URL for a chain in this order (first match wins): a chain-specific var in `.sail/.env.local`, then a generic `RPC_URL` there, then the same two in the shell environment. Two valid patterns:

```bash
# Option A — a single active chain
RPC_URL=https://your-base-endpoint
CHAIN_ID=8453
```

```bash
# Option B — per-chain (multi-chain projects)
CHAIN_ID=8453
BASE_RPC_URL=https://your-base-endpoint
ARBITRUM_RPC_URL=https://your-arbitrum-endpoint
UNICHAIN_RPC_URL=https://your-unichain-endpoint
ETH_MAINNET_RPC_URL=https://your-mainnet-endpoint
BASE_SEPOLIA_RPC_URL=https://your-base-sepolia-endpoint
SEPOLIA_RPC_URL=https://your-sepolia-endpoint
```

Per-chain vars take precedence for their chain, so a multi-chain project resolves each endpoint correctly. `sailor chains --verify` checks every chain that has a configured RPC.

## The same SMA on another chain

Deploy your existing SMA address on an additional chain with the same owner, manager, and salt:

```bash
sailor account deploy-chain --chain 42161
#   --salt <n>   defaults to the saltNonce stored in .sail/account.json
```

Predict first to confirm the address matches across chains:

```bash
sailor account predict --chain 42161
```

Run the agent against a specific chain with `sailor run --chain <id>` (overrides `CHAIN_ID` and `.env.local` for that run).

{% hint style="info" %}
Permission contracts are **per-chain deployments** — registering a permission on Base does not register it on Arbitrum. Author/deploy and register your mandate on each chain you operate. The SMA *address* is shared; its mandate is per-chain.
{% endhint %}
