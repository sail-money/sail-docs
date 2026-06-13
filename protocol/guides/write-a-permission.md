# Write your first permission

We'll build a minimal permission that authorizes ERC-20 `transfer` calls to a fixed recipient, and only to that recipient. It demonstrates every rule from the [implementation checklist](../permissions/ipermission.md#implementation-checklist): length-check, selector routing, target allowlist, value check, decode, fail-closed.

## The contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPermission, Context} from "@sail/interfaces/IPermission.sol";

/// Authorizes ERC-20 transfer(to, amount) calls, but only to `allowedRecipient`,
/// only on `allowedToken`, and only up to `maxAmount`.
contract TransferToRecipientPermission is IPermission {
    bytes4 private constant TRANSFER_SELECTOR = 0xa9059cbb; // transfer(address,uint256)

    address public immutable allowedToken;
    address public immutable allowedRecipient;
    uint256 public immutable maxAmount;

    constructor(address token, address recipient, uint256 max) {
        allowedToken = token;
        allowedRecipient = recipient;
        maxAmount = max;
    }

    function evaluate(bytes calldata txData, Context calldata ctx)
        external view returns (bool)
    {
        // 1. Token calls carry no ETH.
        if (ctx.value != 0) return false;

        // 2. Only the allowlisted token.
        if (ctx.target != allowedToken) return false;

        // 3. Only the transfer selector.
        if (ctx.selector != TRANSFER_SELECTOR) return false;

        // 4. Length check before decoding: 4 + 32 + 32 = 68 bytes.
        if (txData.length < 68) return false;

        // 5. Decode and check the arguments.
        (address to, uint256 amount) = abi.decode(txData[4:], (address, uint256));
        if (to != allowedRecipient) return false;
        if (amount > maxAmount) return false;

        return true;
    }

    function discriminator() external pure returns (bytes32) {
        return keccak256("TransferToRecipientPermission");
    }
}
```

## Why each line is there

* **`ctx.value != 0`** — an ERC-20 transfer should never carry ETH; a non-zero value is a red flag.
* **`ctx.target`** — the call must go to the token you intend; otherwise a manager could call `transfer` on *any* contract.
* **`ctx.selector`** — anything that isn't `transfer` is denied (deny unknown selectors, don't revert).
* **length check before `abi.decode`** — decoding short calldata reverts; the kernel treats a revert as `false`, but an explicit check is clearer and cheaper.
* **`to` / `amount` checks** — the actual bounds. Everything else was a guard so these checks are meaningful.
* **`view` + no state writes** — required: the kernel calls this under `staticcall`.

## Gas

This permission does a handful of comparisons and one `abi.decode` — comfortably inside the 150,000-gas `PERMISSION_GAS_CAP`. If you add oracle reads or storage lookups, keep the total well under the cap (a cold `SLOAD` is 2,100 gas; an external oracle call can be 5–20k+).

## Test it off-chain first

Before registering, you can confirm the permission would approve a given call without spending gas. With the Sailor toolkit this is `sailor mandate simulate`; at the protocol level you can `eth_call` the permission's `evaluate` directly with a constructed `Context`. Only register a permission once you've verified it accepts the calls you intend and rejects the ones you don't.

## Next

Now that you have a permission contract, you need an account to attach it to → [Deploy an SMA](deploy-an-sma.md). For the multi-account pattern (one deployment serving many accounts with per-account config), see [shared templates](../permissions/shared-templates.md).
