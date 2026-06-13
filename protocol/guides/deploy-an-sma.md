# Deploy an SMA

An SMA is a Safe with the Sail kernel enabled as a module and registered in the kernel's `configs`. There are two ways to get one.

## Option A — create a new Safe and register in one call

`createAccount` deploys a Safe through a trusted factory **and** registers it, atomically:

```solidity
function createAccount(
    address safeFactory,      // must be on governance.trustedSafeFactory
    address safeSingleton,    // must be on governance.trustedSafeSingleton
    bytes   calldata safeInitializer, // Safe.setup calldata; its delegatecall `to` must be the trusted SafeModuleEnabler
    uint256 saltNonce,        // your nonce; bound with msg.sender + principals into the CREATE2 salt
    address permissionSigner, // authorizes the mandate
    address manager,          // authorizes dispatches (your agent)
    address feePolicy,        // address(0) for none; otherwise must be trusted
    address feeAsset          // canonical fee token; address(0) = native ETH
) external returns (address account);
```

The `safeInitializer` is the Safe's own `setup(...)` calldata, where the `to`/`data` delegatecall hook points at the **`SafeModuleEnabler`** so the kernel is enabled as a module during setup (see [SafeModuleEnabler](../architecture/safe-module-enabler.md)). The kernel:

1. checks `safeFactory` / `safeSingleton` are trusted;
2. extracts the setup delegatecall target from `safeInitializer[68:100]` and checks it's a trusted module-setup helper (or `address(0)` for a vanilla setup);
3. computes the bound salt and predicts the proxy address — if a proxy already exists there, it **adopts** it instead of redeploying;
4. requires the deployed Safe to have the kernel enabled as a module (`ModuleNotEnabled` otherwise);
5. registers the account in `configs`.

The bound salt is:

```
boundSalt = keccak256(saltNonce, msg.sender, permissionSigner, manager, feePolicy)
```

## Option B — register an existing Safe

If you already have a Safe, enable the kernel as a module and have the Safe call `registerAccount` itself:

```solidity
function registerAccount(
    address permissionSigner, address manager, address feePolicy, address feeAsset
) external; // MUST be called by the Safe (msg.sender == Safe)
```

The kernel verifies the caller's runtime codehash is a trusted Safe-proxy codehash and that the kernel is already enabled as a module — so only a genuine Safe that has actually added the module can self-register. Typically the `enableModule` and `registerAccount` calls are batched in one Safe transaction.

## Predict the address first

Because the salt binds the principals, you can compute the SMA's address **before** deploying, and it is identical on every supported chain (see [deterministic addresses](../reference/deterministic-addresses.md)). This lets you fund the address ahead of deployment. Note the front-run protection: a deployment supplying a *different* `permissionSigner` or `manager` lands at a *different* address, so no one can squat your counterfactual SMA with their own principals.

## What you have now

A registered SMA with `sessionActive = true`, a `permissionSigner`, a `manager`, and (optionally) a fee policy — but **no permissions yet**. Until you register at least one permission, every dispatch reverts with `PermissionNotRegistered` (deny-by-default). Next: [register a mandate](register-a-mandate.md).
