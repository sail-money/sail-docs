# Use a shared template

`SharedBoundedSwapPermission` is an **example** template that demonstrates the shared multi-tenant pattern — one deployed contract serving many accounts, each with its own configuration. This guide configures it for an account end to end; the pattern generalizes to every shared template, with only the `params` layout changing. As with all shipped templates, treat it as a reference to read, adapt, and verify rather than an audited, drop-in contract — see the framing on [Shared multi-tenant templates](../permissions/shared-templates.md).

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

{% hint style="info" %}
The shipped templates are reference examples, not a fixed part of the protocol (see [Shared multi-tenant templates](../permissions/shared-templates.md)). To use this flow today, deploy the template yourself, or use one once it is published in the deployment manifests. You are responsible for the correctness of any permission you register — read and test a template's `evaluate` logic before registering it in production.
{% endhint %}
