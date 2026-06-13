# SafeModuleEnabler

`SafeModuleEnabler` is a tiny, stateless helper whose only job is to enable the Sail kernel as a Safe **module** on a freshly created Safe, in the same transaction that creates it. License: MIT.

## Why it's needed

Safe's `enableModule(address)` is gated by an `authorized` modifier requiring `msg.sender == address(this)` — i.e. the Safe can only enable a module via a call from *itself*. For a brand-new Safe that has not yet executed any owner transaction, the **only** window to satisfy that is the `to` / `data` **delegatecall** hook inside `Safe.setup`.

The enabler exploits exactly that window:

```solidity
contract SafeModuleEnabler {
    function enable(address module) external {
        ISafeModuleEnable(address(this)).enableModule(module);
    }
}
```

When `Safe.setup` **delegatecalls** `enable(module)`, `address(this)` resolves to the **Safe itself**, so the inner `enableModule(module)` is a valid Safe → Safe call. The kernel becomes a module before the first owner transaction ever runs.

## Properties

* **Stateless and reentrancy-safe by construction** — it holds no storage.
* **Must be delegatecalled.** Called directly, the inner `enableModule` targets the enabler (which has no such function) and reverts — so it cannot be misused as a standalone call.
* **Deployed once per chain** at a chain-identical address, and referenced as the `to` target in the Safe initializer passed to `SailKernel.createAccount`.

## How the kernel uses it

`createAccount` validates that the `to` target embedded in the Safe initializer (`safeInitializer[68:100]`) is on governance's `trustedModuleSetup` allowlist — so only this audited enabler can be the setup delegatecall target. After deployment, `createAccount` checks `ISafe(account).isModuleEnabled(address(this))` and reverts with `ModuleNotEnabled` if the enabler did not run. This is the structural defense (Octane #1) against an attacker supplying a malicious setup delegatecall that overwrites the proxy's storage.
