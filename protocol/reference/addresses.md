# Deployment addresses

The trusted core is deployed via deterministic CREATE2 with a global salt per contract, so **every core contract has the same address on every supported chain** (deployed 2026-06-09, commit `1199b33`). The [Protocol repository](https://github.com/sail-money/Protocol/blob/main/deployments/addresses.md) is the canonical source of truth.

## Core addresses (identical on all six chains)

| Contract | Address |
| --- | --- |
| `SailKernel` | `0x02ABC18B65A328de2e749F56ba79ACF2718a6659` |
| `SailGovernance` | `0x7A478118715791728BDE3bc7A4D7ECfdEB89C6EC` |
| `TimelockController` | `0xE48Ba8DB6d748adafD13155c3590f62e58a77f56` |
| `MandateFactory` | `0x14EDd6c2a56EfC0d71E215ab13094B9AF90543d2` |
| `StandardFeePolicy` | `0xe7B5901b839cFFDEd9D4108A22712C8BfdA1D80D` |
| `SafeModuleEnabler` | `0x7897Cb53a4be4a2eaAf46D60573C4Fd83b33fE1F` |
| Treasury | `0xB01dCE443d052e44b7D13726c0EC9fFB7f5815B6` |

## Supported chains

| Chain | Chain ID | Status |
| --- | --- | --- |
| Ethereum | 1 | live (CREATE2, bootstrapped) |
| Base | 8453 | live (CREATE2, bootstrapped) |
| Arbitrum | 42161 | live (CREATE2, bootstrapped) |
| Unichain | 130 | live (CREATE2, bootstrapped) |
| Base Sepolia | 84532 | live (CREATE2, bootstrapped) |
| Eth Sepolia | 11155111 | live (CREATE2, bootstrapped) |

All six run the selective-dispatch kernel with zero fees, bootstrapped with a genesis allowlist so `createAccount` works immediately.

## External dependencies (canonical, present on all six chains)

| Contract | Address |
| --- | --- |
| CREATE2 factory | `0x4e59b44847b379578588920cA78FbF26c0B4956C` |
| Safe v1.4.1 ProxyFactory | `0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67` |
| Safe v1.4.1 singleton | `0x41675C099F32341bf84BFc5382aF534df5C7461a` |
| SafeL2 v1.4.1 singleton | `0x29fcB43b46531BcA003ddC8FCB67FFE91900C762` |

These are the values seeded into the kernel's trusted allowlists at genesis (`trustedSafeFactory`, `trustedSafeSingleton`, `trustedModuleSetup` → the `SafeModuleEnabler` above, `trustedFeePolicy` → the `StandardFeePolicy` above, plus the Safe-proxy runtime codehash).

{% hint style="warning" %}
**Permission templates are not yet deployed against the current kernel** on any chain. The shipped shared templates are unaudited references; their deployment addresses will be published in the repo's `deployments/` manifests as they are deployed and verified. Until then, deploy templates yourself.
{% endhint %}

{% hint style="info" %}
**Audit status.** These are staging deployments under an ongoing [Octane Security](https://octane.security) audit — not final. Do not use with funds you are not prepared to lose.
{% endhint %}
