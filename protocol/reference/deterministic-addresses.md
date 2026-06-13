# Deterministic addresses

How Sail achieves identical core addresses across chains, and identical SMA addresses across chains — with the exact formulas from `SailKernel.createAccount`.

## Core salts

Each core contract is deployed through the standard CREATE2 factory (`0x4e59b44847b379578588920cA78FbF26c0B4956C`) with a chain-independent salt and identical constructor arguments:

| Contract | Salt |
| --- | --- |
| TimelockController | `keccak256("sail.timelock.v1")` |
| SailGovernance | `keccak256("sail.governance.v1")` |
| SailKernel | `keccak256("sail.kernel.v1")` |
| MandateFactory | `keccak256("sail.mandatefactory.v1")` |
| StandardFeePolicy | `keccak256("sail.feepolicy.v1")` |
| SafeModuleEnabler | `keccak256("sail.modulenabler.v1")` |

A CREATE2 address is `keccak256(0xff ++ factory ++ salt ++ keccak256(initCode))[12:]`. Since the factory and salt are identical everywhere, the address is identical **iff the init code (constructor args included) is identical**. Injecting the timelock into `SailGovernance` (rather than constructing it inline) is what makes every constructor argument chain-independent.

## SMA address binding

When the kernel creates an account it derives the Safe's CREATE2 salt by binding the caller's nonce to the principals:

```solidity
boundSalt = uint256(keccak256(abi.encode(
    saltNonce, msg.sender, permissionSigner, manager, feePolicy
)));
```

It then predicts the Safe proxy address with the exact formula the Safe v1.4.1 `SafeProxyFactory` uses, so an already-deployed proxy at that address is adopted rather than re-deployed:

```solidity
// create2Salt = keccak256(keccak256(initializer), boundSalt)
bytes32 create2Salt = keccak256(abi.encodePacked(keccak256(safeInitializer), boundSalt));

// initCodeHash = keccak256(proxyCreationCode ++ uint256(uint160(singleton)))
bytes32 initCodeHash = keccak256(abi.encodePacked(
    ISafeFactory(safeFactory).proxyCreationCode(),
    uint256(uint160(safeSingleton))
));

address predicted = address(uint160(uint256(keccak256(abi.encodePacked(
    bytes1(0xff), safeFactory, create2Salt, initCodeHash
)))));
```

Because the `safeInitializer` references only chain-identical contracts (the kernel and the `SafeModuleEnabler`), the same `(owner, permissionSigner, manager, feePolicy, saltNonce)` yields the **same SMA address on every supported chain**.

## Front-run resistance

Binding the principals into `boundSalt` means a deployment supplying a different `permissionSigner` or `manager` lands at a **different** address. An attacker therefore cannot register *your* counterfactual address with *their* principals — the address itself is a commitment to the principals (Octane #4 / #16).

## Predicting off-chain

To compute an SMA address before deployment, reproduce the two-step derivation above with your chosen `saltNonce` and principals and the canonical Safe v1.4.1 factory/singleton from [addresses](addresses.md). The Sailor SDK exposes this as `account predict`; at the protocol level, mirror the Solidity above. You can fund the predicted address before the Safe exists on a given chain.
