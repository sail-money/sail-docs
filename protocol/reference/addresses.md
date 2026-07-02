# Deployment addresses

Both the trusted core and the seven shared permission templates deploy via **deterministic CREATE2 with a global (chain-independent) salt per contract**, through the standard CREATE2 factory `0x4e59b44847b379578588920cA78FbF26c0B4956C`. The practical consequence: **every core contract and every template has the same address on every chain**, and so does the resulting SMA. The [Protocol repository](https://github.com/sail-money/Protocol/blob/main/deployments/addresses.md) is the canonical source of truth.

## Core addresses (identical on every chain)

| Contract | Address |
| --- | --- |
| `SailKernel` | `0x38b508756c976e876EFF05a29E731A4d348BA6ED` |
| `SailGovernance` | `0x4315B37cA4A315A7042af1Fcb37F8436f4D24356` |
| `TimelockController` | `0xC1E5F9A581D4100Aa949f80204540a33aD97A7b6` |
| `MandateFactory` | `0x6d2C802ffa0d9A8Ed69A5Bf22c1b63ccB566B8Fc` |
| `StandardFeePolicy` | `0x1087312447C8a2BfA15EB9cE23590E3502DBA04b` |
| `SafeModuleEnabler` | `0x7897Cb53a4be4a2eaAf46D60573C4Fd83b33fE1F` |

## Shared permission templates (identical on every chain)

Multi-tenant templates — one deployment per chain serves every account, bound to the canonical core kernel above (constructor `(kernel, author)`, `author` = the deployer EOA below).

| Template | Address |
| --- | --- |
| `SwapPermission` | `0x35cEEa0db96997Cc3CF3beB42FFa36A499342F7C` |
| `SwapPermissionNoOracle` | `0x34Ba96CbEd1f46c88A5265E645DC5fe41662b519` |
| `BorrowPermission` | `0x3e2666051599223cEAb10De55C89A0842857d8AF` |
| `DepositPermission` | `0xBfB5e13a97b12Ee89d2F2b9B65eCf7e0E371911f` |
| `WithdrawPermission` | `0xF5eF5dda450a130e3020d54f565E830e4a7531f8` |
| `TransferPermission` | `0xda909a1CC584fb7559Ce4A828b008B473Da095e1` |
| `ApproveAndCallBatchPermission` | `0x0535A4D51333484ef583103DAB1a9449756ab732` |

{% hint style="info" %}
The shared templates are **reviewed reference implementations** (see [Security](../security/README.md)), not audited drop-in production contracts. You are responsible for the correctness of any permission you register — read, verify, and test before production use. See [permission correctness is the author's responsibility](../security/limitations.md).
{% endhint %}

## Governance & config (identical on every chain)

| Role | Address | Notes |
| --- | --- | --- |
| Admin Safe (3/5) | `0x152a32c851d317Cd54F1E6423377d7D58Dd3DE8C` | parameter governance behind the 48h timelock |
| Treasury Safe (3/5) | `0x7b37F85575F1568a37dBA342BC5FE6d393F0872f` | protocol fee recipient |
| Emergency Safe (2/3) | `0xFf02DE6630F192Bc6d14608f5C52a9f1ae478961` | emergency pause (auto-expiry + cooldown) |
| Deployer EOA | `0xB01dCE443d052e44b7D13726c0EC9fFB7f5815B6` | deployment only; holds no protocol authority |

## Supported chains

All chains run the selective-dispatch kernel via CREATE2 and have had their onboarding allowlists bootstrapped (`allowlistBootstrapped() == true`).

| Chain | Chain ID | Native | Type | Explorer-verified |
| --- | --- | --- | --- | :---: |
| Ethereum | 1 | ETH | mainnet | ✅ |
| Base | 8453 | ETH | mainnet | ✅ |
| Arbitrum | 42161 | ETH | mainnet | ✅ |
| Optimism | 10 | ETH | mainnet | ✅ |
| Unichain | 130 | ETH | mainnet | ✅ |
| World | 480 | ETH | mainnet | ✅ |
| MegaETH | 4326 | ETH | mainnet | ✅ |
| BSC | 56 | BNB | mainnet | ✅ |
| HyperEVM | 999 | HYPE | mainnet | ⬜ (source not yet published on explorer) |
| Base Sepolia | 84532 | ETH | **testnet** | ✅ |
| Eth Sepolia | 11155111 | ETH | **testnet** | ✅ |

That's **11 chains — 9 mainnets and 2 testnets.** The CREATE2 factory (`0x4e59b44847b379578588920cA78FbF26c0B4956C`) and the Safe v1.4.1 proxy factory (`0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67`) are present at their canonical addresses on all eleven, so the same-address property holds on each.

## Fees (live)

| Fee | Value |
| --- | --- |
| Permission registration fee (live) | `0.00015 ETH` on the 9 ETH-native chains; `0.00045 BNB` on BSC; `0.005 HYPE` on HyperEVM |
| Registration-fee cap (immutable) | `MAX_PERMISSION_FEE_WEI` = `0.01` native-unit ceiling per chain |
| Protocol cut on manager fees | `0` at launch (immutable cap `MAX_PROTOCOL_CUT_BPS` = 2500 bps = 25%) |
| Management / performance / distributor fees | `0` at launch |

The registration fee was deployed at `0.00015` native on **every** chain (CREATE2 requires byte-identical constructor arguments, so the address is only reproducible with the same fee). Governance later raised the **live** rate on BSC and HyperEVM via the 48h timelock — which does not change the already-locked contract address. See [Fees](../fees-and-governance/fees.md).

## External dependencies (canonical, present on all chains)

| Contract | Address |
| --- | --- |
| CREATE2 factory | `0x4e59b44847b379578588920cA78FbF26c0B4956C` |
| Safe v1.4.1 ProxyFactory | `0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67` |
| Safe v1.4.1 singleton | `0x41675C099F32341bf84BFc5382aF534df5C7461a` |
| SafeL2 v1.4.1 singleton | `0x29fcB43b46531BcA003ddC8FCB67FFE91900C762` |

These are the values seeded into the kernel's trusted allowlists (`trustedSafeFactory`, `trustedSafeSingleton`, `trustedModuleSetup` → the `SafeModuleEnabler` above, `trustedFeePolicy` → the `StandardFeePolicy` above, plus the Safe-proxy runtime codehash). For this deploy, governance is the admin Safe, so allowlists were seeded post-deploy via `SailGovernance.bootstrapAllowlists()` (a one-shot, non-timelocked latch) rather than at genesis.

{% hint style="info" %}
**Security review.** The trusted core and shared templates were reviewed by [Octane](https://www.octane.security), an AI source-code security scanner, across three analyses; the final analysis found no critical- or high-severity findings. A review is not a proof of correctness — do not use with funds you are not prepared to lose. See [Security](../security/README.md).
{% endhint %}