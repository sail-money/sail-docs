# Exports & helpers

The lower-level public surface of `@sail.money/sailor/sdk`, grouped by purpose. Internal and experimental exports are omitted. Types are mirrored from source.

## EIP-712 signing

| Export | Purpose |
| --- | --- |
| `buildDispatchSignature` | Self-detecting `Dispatch` signer — reads the kernel's on-chain typehash and signs the correct (selective/conjunctive) struct. **Use this; don't hand-roll.** |
| `sailKernelDomain` | The EIP-712 domain for any `SailKernel`. |
| `DISPATCH_EIP712_FIELDS` | Typed struct field lists keyed by dispatch model. |
| `buildRegisterPermissionTypedData` | Build `RegisterPermission` typed data (accepts `hasDeadline`). |
| `buildRegisterPermissionsBatchTypedData` | Batch (`RegisterPermissions`) typed data. |
| `signRegisterPermission` | Sign a `RegisterPermission` message. |
| `REGISTER_PERMISSION_TYPES`, `REGISTER_PERMISSION_TYPES_NO_DEADLINE`, `REGISTER_PERMISSIONS_BATCH_TYPES` | The EIP-712 type definitions. |

```ts
import { buildDispatchSignature, LocalKeyring } from "@sail.money/sailor/sdk";
import { createPublicClient, http } from "viem";

const publicClient = createPublicClient({ transport: http(rpcUrl) });
const manager = await LocalKeyring.fromKeystoreFile(".sail/keys/manager.json", passphrase);

const { signature, nonce, deadline, dispatchModel } = await buildDispatchSignature({
  publicClient, kernel, chainId: 8453,
  account: mySafe, permission: myPermission,
  call: { target: router, value: 0n, data: swapCalldata },
  manager,
});
// kernel.dispatch(account, permission, target, value, data, signature, deadline)
```

## Kernel capability detection

| Export | Purpose |
| --- | --- |
| `detectKernelCapabilities` | Read `DISPATCH_TYPEHASH` on-chain; identify conjunctive vs selective. |
| `clearCapabilityCache` | Clear the per-process capability cache. |
| `DispatchModel`, `KernelCapabilities` | Result types. |
| `DISPATCH_TYPE_STRINGS`, `DISPATCH_TYPEHASHES`, `REGISTER_PERMISSION_TYPE_STRINGS`, `REGISTER_PERMISSION_TYPEHASHES` | The known type strings/hashes per model. |

## Kernel errors

| Export | Purpose |
| --- | --- |
| `decodeKernelError` | Decode a revert into a typed `KernelError`. |
| `explainKernelRevert` | Human-readable explanation of a kernel revert. |
| `KERNEL_ERROR_ABI`, `KERNEL_ERROR_SIGNATURES` | The error ABI + 4-byte signatures. |

```ts
import { explainKernelRevert } from "@sail.money/sailor/sdk";
try { /* dispatch */ } catch (e) { console.error(explainKernelRevert(e)); }
```

## Deployments & chains

| Export | Purpose |
| --- | --- |
| `getSailDeployment(chainId)` | Resolve the kernel / factory / governance addresses for a chain. |
| `sailDeployments`, `normalizeDeployment` | The full registry + a normalizer. |
| `chains`, `getChain` | The chain registry (`ChainConfig` per chainId). |
| `SailChainId`, `SailDeployment`, `KnownTemplate`, `CloneTemplateInfo`, `CloneTemplateParam`, `ChainConfig` | Registry types. |

## Safe-address math

| Export | Purpose |
| --- | --- |
| `computeSailSmaAddress` | Predict an SMA address from principals + salt (the [deterministic address](../../protocol/reference/deterministic-addresses.md)). |
| `computeKernelBoundSalt` | Compute `boundSalt = keccak256(saltNonce, caller, permissionSigner, manager, feePolicy)`. |
| `computeSafeProxyAddress` | Predict the Safe proxy CREATE2 address. |
| `buildSafeSetupInitializer` | Build the Safe `setup` calldata (with the module-enabler delegatecall). |
| `encodeSetManager`, `buildSetManagerExecTransaction` | Manager-rotation calldata / Safe exec. |
| `buildApprovedHashSignature` | Safe approved-hash signature helper. |
| `SAFE_V141` | Canonical Safe v1.4.1 addresses. |
| `gnosisSafeAbi`, `gnosisSafeExecAbi`, `safeModuleEnablerAbi`, `safeProxyFactoryAbi` | Safe-side ABIs. |

## Discovery, fees, and swaps

| Export | Purpose |
| --- | --- |
| `discoverSafesForOwner`, `getSafeTransactionServiceUrl` | Find an owner's Safes via the Safe transaction service. |
| `estimatePermissionFee` | Estimate the kernel registration fee. |
| `fetchLifiQuote`, `minTokenOut`, `encodeApprove`, `LIFI_ROUTERS`, `LIFI_QUOTE_URL`, `DEFAULT_SLIPPAGE` | Aggregator (LiFi) swap primitives behind `client.strategy.swap`. |
| `FetchLifiQuoteParams`, `LifiSwapQuote` | Swap quote types. |

## Keyring & ABIs

| Export | Purpose |
| --- | --- |
| `LocalKeyring` (+ `EncryptedKeystore`, `LocalKeyringOptions`) | Load/sign with the encrypted manager key (geth keystore v3). |
| `SailKernelAbi`, `MandateFactoryAbi`, `SailGovernanceAbi` | Trusted-core ABIs. |
| Signing-station message types | `ClientMessage`, `ServerMessage`, `SigningRequest`, `SigningResponse`, `SigningTxRequest`, `SigningTypedDataRequest`, `SerializedTypedData`, … |

## Core domain types

`Account`, `Mandate`, `MandateExplanation`, `Call`, `Dispatch`, `PreviewResult`, `SimulationResult`, `TxResult`, `DispatchOptions`, `SwapParams`, `SwapResult`, `Session`, `FeePolicy`, `PermissionTemplate`, `TemplateEncoder`, `TemplateExplainer`, `MandateItem`, `MandateDraftInput`, `SailorClientConfig`, `CreateAccountParams`, `RegisterAccountParams`, plus the `Agent` / `AgentContext` types ([The Agent interface](agent.md)).
