# Use a shared template

Shared templates let one deployed contract serve many accounts, each with its own configuration. This guide configures `SharedBoundedSwapPermission` for an account end to end. The pattern generalizes to every shared template — only the `params` layout changes.

## 1. Encode the config params

`SharedBoundedSwapPermission` decodes this exact tuple:

```solidity
bytes memory params = abi.encode(
    routers,          // address[]  allowlisted swap routers
    tokensIn,         // address[]  tokens the agent may sell
    tokensOut,        // address[]  tokens the agent may buy
    maxAmountPerTx,   // uint256     per-swap input cap
    maxSlippageBps,   // uint256     max slippage in bps (< 10000)
    priceOracle,      // address     IOracle; address(0) disables the oracle check
    maxPriceAgeSec    // uint256     required freshness bound if priceOracle != 0
);
```

Constraints enforced at configure time: `maxSlippageBps` must be `< 10000` (`SlippageBpsTooLarge` otherwise), and if `priceOracle != address(0)` then `maxPriceAgeSec` must be non-zero (`MissingPriceAge` otherwise — a configured oracle must come with a freshness bound).

## 2. Configure + register in one transaction

Use the `MandateFactory.attach`, which calls `template.configure(...)` then `kernel.registerPermission(...)`:

```solidity
factory.attach{value: registrationFee}(
    account,
    template,            // the SharedBoundedSwapPermission deployment
    params,
    configureDeadline,
    configureSig,        // Permission Signer EIP-712 over Configure(account, keccak256(params), nonce, deadline)
    kernelDeadline,
    kernelSig            // Permission Signer EIP-712 over RegisterPermission(account, template, nonce, deadline)
);
```

The two signatures use two different nonces: `configureSig` uses the template's `configNonces(account)`; `kernelSig` uses the kernel's `signerNonces(account)`. The factory holds no privilege — both inner calls are authorized purely by these signatures — and refunds any fee excess.

The `Configure` type string (from `BaseSharedPermission`):

```
Configure(address account,bytes32 paramsHash,uint256 nonce,uint256 deadline)
```

## 3. Dispatch a swap

The manager now dispatches a swap call, naming the template as the permission. `SharedBoundedSwapPermission.evaluate` recognizes three selectors and checks, per the account's config:

* Uniswap V3 `exactInputSingle` (`0x414bf389`, with deadline) and SwapRouter02 variant (`0x04e45aaf`, no deadline);
* V2-style `swapExactTokensForTokens` (`0x38ed1739`).

For each, it verifies the **router** is allowlisted (`ctx.target`), the **input and output tokens** are allowlisted, the **recipient is the SMA itself** (`recipient == ctx.account`), the **amount** is `<= maxAmountPerTx`, and — if an oracle is configured — that `amountOutMinimum` is at least the oracle-derived minimum after slippage. Anything else returns `false` and the dispatch reverts with `PermissionDenied`.

## 4. Reconfigure or replace

* To change the bounds, the Permission Signer signs a fresh `Configure` (new nonce) — it clears the old config and applies the new one atomically. Submit via `factory.reconfigure(...)`.
* To **tighten** safely without a front-run window, deploy/configure a new permission and `factory.replace(...)` (atomic kernel swap). See [the lifecycle](../permissions/lifecycle.md).

{% hint style="warning" %}
The shipped shared templates are **unaudited references** and are **not yet deployed against the current kernel**. To use this flow today, deploy the template yourself (or use one once it's published in the deployment manifests). Always verify a template's `evaluate` logic before registering it.
{% endhint %}
