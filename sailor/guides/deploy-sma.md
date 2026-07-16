# Deploy & predict an SMA

An SMA is a Safe registered with `SailKernel`, with the kernel enabled as a module. Sailor creates and tracks it in `.sail/account.json`.

## Predict the address first

Because the kernel binds the [CREATE2 salt to the account's principals](../../protocol/concepts/deterministic-deployment.md), you can compute the SMA address before deploying — and it's identical on every supported chain.

```bash
sailor account predict
# options:
#   --owner <address>     owner EOA (defaults to .sail/account.json)
#   --manager <address>   agent (manager) wallet, mixed into the kernel salt
#   --salt <n>            CREATE2 salt nonce (default: 0)
#   --chain <id>          show the prediction for one chain only
#   --json                machine-readable output
```

The same owner + manager + salt produce the same address everywhere, so you can fund the address ahead of deployment. A different manager or salt lands at a different address (front-run resistance).

## Deploy

```bash
sailor onboard --new-sma
# options:
#   --sma <address>       use a specific SMA instead of prompting
#   --new-sma             create a new SMA via SailKernel
#   --salt <n>            CREATE2 salt (0 for your first SMA; increment for subsequent ones)
#   --template <k|addr>   also register this permission (kind, label, or address)
#   --skip-mandate        skip the permission-registration step
#   --json                non-interactive JSON output
```

`onboard` walks the full setup: it creates the SMA on-chain (owner signs in the [signing server](../concepts/keys-and-custody.md)), optionally attaches a first mandate, and confirms the agent is operational. Owner-signed steps go through the browser; the agent submits what it's allowed to.

## Deploy the same address on another chain

Once an SMA exists, replicate its address on another supported chain with the same principals:

```bash
sailor account deploy-chain --chain 42161    # --chain is required
#   --salt <n>   defaults to the saltNonce stored in .sail/account.json
#   --json
```

See [Multi-chain operation](multi-chain.md).

## Inspect what you have

```bash
sailor status                 # current account, permission, and session status
sailor scan                   # discover the owner's SMAs + permissions + keys → context.json
sailor doctor                 # read-only preflight: kernel model, permission health, RPC + gas balances
```

`doctor` is the right first call before spending gas — it reports the kernel's [dispatch model](../../protocol/architecture/dispatch.md), permission health, RPC reachability, and gas balances.

Next: [Build & register a mandate](build-a-mandate.md).
