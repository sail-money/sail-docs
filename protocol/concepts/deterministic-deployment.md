# Deterministic deployment

Sail's trusted core has the **same address on every supported chain**, and every SMA derives the **same address on every chain**. This is a deliberate property, not a coincidence, and it shapes how integrations are built.

## The core: identical addresses everywhere

Every core contract is deployed through the standard CREATE2 factory (`0x4e59b44847b379578588920cA78FbF26c0B4956C`) with a **global, chain-independent salt per contract** and **identical constructor arguments** on every chain. A CREATE2 address is:

```
address = keccak256(0xff ++ factory ++ salt ++ keccak256(initCode))[12:]
```

The factory is the same everywhere and the salt carries no chain ID, so the address is identical **iff the init code (which includes the constructor arguments) is identical**. The salts are:

| Contract | Salt |
| --- | --- |
| TimelockController | `keccak256("sail.timelock.v1")` |
| SailGovernance | `keccak256("sail.governance.v1")` |
| SailKernel | `keccak256("sail.kernel.v1")` |
| MandateFactory | `keccak256("sail.mandatefactory.v1")` |
| StandardFeePolicy | `keccak256("sail.feepolicy.v1")` |
| SafeModuleEnabler | `keccak256("sail.modulenabler.v1")` |

A key enabler is that `TimelockController` is **deployed separately and injected** into `SailGovernance`'s constructor, rather than constructed inline. That makes every `SailGovernance` constructor argument chain-independent — which is what lets its address (and therefore the kernel's, and therefore every SMA's) match across chains. See the [addresses reference](../reference/addresses.md) for the live values.

## Accounts inherit the property

When an account is created, the kernel derives the Safe's CREATE2 salt by binding the caller's salt nonce together with the account's principals:

```
boundSalt = keccak256(saltNonce, caller, permissionSigner, manager, feePolicy)
```

The Safe initializer references only chain-identical contracts (the kernel and the module enabler), so:

> The same owner, permission signer, manager, fee policy, and salt nonce produce the **same SMA address on every supported chain**.

Assets sent to that address on any supported chain reach the same account — whether or not the Safe has been deployed there yet.

## Why bind principals into the salt?

Binding the principals into the salt also closes a front-running gap: a counterfactual address **cannot** be squatted with different principals. A deployment that supplies a different manager or signer lands at a *different* address, so an attacker cannot register "your" address with their own manager. (This corresponds to Octane findings #4 / #16.)

## Practical consequences

* **Predict before you deploy.** You can compute an SMA's address off-chain and fund it before the Safe exists on a given chain.
* **One identity, many chains.** Cross-chain tooling can treat an SMA as a single address.
* **Idempotent creation.** If a proxy already exists at the predicted address (a retry, or a legitimate pre-deploy), `createAccount` adopts it instead of reverting.

See [deterministic addresses](../reference/deterministic-addresses.md) for the exact prediction formula and code.
