# SailorClient

`SailorClient` is the high-level entry point. Construct it with an RPC URL and chain id; read-only methods work immediately, and state-changing methods take a manager/permission-signer `LocalKeyring`.

```ts
import { SailorClient } from "@sail.money/sailor/sdk";

const client = new SailorClient({
  rpcUrl: "https://...",
  chainId: 8453,
  kernel: "0x38b508756c976e876EFF05a29E731A4d348BA6ED", // required for on-chain ops
  mandateFactory: "0x6d2C802ffa0d9A8Ed69A5Bf22c1b63ccB566B8Fc", // for bundled attach flows
});

const caps = await client.capabilities(); // detect dispatch model + EIP-712 shape
```

`SailorClientConfig`: `{ rpcUrl: string; chainId: number; kernel?: Address; mandateFactory?: Address }`. Resolve `kernel`/`mandateFactory` from the registry with `getSailDeployment(chainId)` (see [Exports & helpers](reference.md)).

## Namespaces

The client groups operations into namespaces.

### `client.account`

| Method | Description |
| --- | --- |
| `create(params: CreateAccountParams): Promise<Account>` | Deploy a new Safe and register it with the kernel in one transaction (sets `permissionSigner` + `manager`). |
| `registerExisting(safe, params): Promise<Account>` | Register an existing Safe you control, without redeploying. |
| `get(safe): Promise<Account>` | Fetch current account state from the kernel. |

### `client.mandate`

| Method | Description |
| --- | --- |
| `attach(safe, template, params, signer)` | Register a single `IPermission` (signer must be the Safe's permission signer). |
| `attachBatch(safe, items, signer)` | Register multiple permissions atomically (one Safe tx). |
| `reconfigure(safe, template, params, signer)` | Update params on a registered permission (re-signs the mandate). |
| `replace(safe, oldTemplate, newTemplate, params, signer)` | Atomically replace one permission with another. |
| `detach(safe, template, signer)` | Remove a permission from the registered set. |
| `deployAndAttachClone(safe, impl, initData, salt, signer)` | Clone an implementation (ERC-1167) and attach it. |
| `list(safe): Promise<Mandate[]>` | All currently registered mandates. |
| `isRegistered(safe, permission): Promise<boolean>` | Whether a permission is registered and active. |
| `draft(input: MandateDraftInput): Promise<MandateExplanation>` | Turn a natural-language description into human-readable mandate terms matched against known templates. |

### `client.dispatch`

| Method | Description |
| --- | --- |
| `single(safe, permission, call, manager, options?)` | Submit one call through `SailKernel.dispatch()`. |
| `batch(safe, permission, calls, manager)` | Submit multiple calls as one kernel dispatch (atomic). |
| `preview(safe, permission, calls): Promise<PreviewResult>` | Simulate via the kernel's `previewBatch` view (no tx); returns `{ approved, calls, reason?, simulation? }`. |

`DispatchOptions` (all optional): `nonce` (sign with exactly this manager nonce), `awaitNonce` (wait for a minimum on-chain nonce before signing — handles lagging RPC nodes), `gas` (explicit limit, skips `eth_estimateGas`), `deadline` (defaults to 5 minutes out). Back-to-back `dispatch.single` calls track the nonce automatically.

### `client.strategy`

| Method | Description |
| --- | --- |
| `swap(safe, params: SwapParams, manager): Promise<SwapResult>` | A delegated token swap via the integrated aggregator (LiFi): fetch a quote, top up the router allowance only if below `amount`, then dispatch the swap. Approve + swap go through `dispatch.single`, so the manager nonce is orchestrated automatically. |

`SwapParams`: `from`, `to`, `amount`, optional `slippage` (fraction, default `0.03`), `swapPermission` (required on selective kernels), `approvePermission` (defaults to `swapPermission`), `approveAmount` (defaults to `amount` — approve a larger batch to collapse subsequent buys to swap-only dispatches), `recipient` (defaults to the SMA), `router`.

### `client.session`

`revoke(safe, signer)` · `activate(safe, signer)` · `status(safe): Promise<Session>` — revoke or re-enable the manager's dispatch rights, or read the current session state.

### `client.fees`

`setPolicy(safe, policy: FeePolicy, signer)` · `collect(safe, gross, nav, token, manager): Promise<TxResult>` — set the management/performance fee policy, or trigger collection (gross = AUM value, nav = NAV for the high-water mark).

### `client.principal`

`recordDeposit(safe, amount, signer)` · `recordWithdrawal(safe, amount, signer)` — record LP deposits/withdrawals in the kernel's principal ledger (cost basis for performance-fee math).

### `client.capabilities()`

Returns `KernelCapabilities` — detects the deployed kernel's dispatch model (conjunctive vs selective) and EIP-712 shape by reading its on-chain typehash constants. Use this rather than assuming a model.

## Keyrings

State-changing methods take an `ILocalKeyring` (`address`, `sign(hash)`, `signTyped(domain, types, value)`). Load the encrypted manager key with `LocalKeyring`:

```ts
import { LocalKeyring } from "@sail.money/sailor/sdk";
const manager = await LocalKeyring.fromKeystoreFile(".sail/keys/manager.json", process.env.SAIL_PASSPHRASE!);
```

See [Exports & helpers](reference.md) for `LocalKeyring`, the EIP-712 builders, and capability detection.
