# Permission lifecycle

Every change to an account's mandate is authorized by the **Permission Signer** through an EIP-712 signature, and (for shared templates) configuration is authorized the same way. Each operation consumes the account's `signerNonces` (configuration consumes the template's own `configNonces`), and each carries a `deadline`. See the [EIP-712 reference](../reference/eip712.md) for exact type strings.

## Registration

The Permission Signer signs a `RegisterPermission(account, permission, nonce, deadline)` message. The kernel checks the permission is a deployed contract, isn't already registered, and that the account is below `maxPermissionsPerAccount`; it then appends the permission and charges the flat registration fee (excess ETH refunded). Use `registerPermissions(...)` to add several atomically under one nonce.

```solidity
kernel.registerPermission{value: fee}(account, permission, deadline, signerSig);
```

## Configuration & reconfiguration

For a shared template, the Permission Signer signs a `Configure(account, keccak256(params), nonce, deadline)` message; anyone may submit it (the `MandateFactory` is the canonical submitter, but holds no privilege). A subsequent `configure` with a fresh nonce **clears previous state and applies the new params atomically**. Registration and configuration are independent — registration adds the address to the mandate; configuration sets that address's per-account rules.

{% hint style="info" %}
**Sequencing.** Dispatch authorizes by permission *address*, not by configuration *state*. To **tighten** a permission's rules safely, prefer `replacePermission` (atomic swap to a freshly-configured permission) over reconfiguring in place — an in-place `configure` has a front-run window while the transaction is pending.
{% endhint %}

## Atomic replacement

`replacePermission(account, old, new, deadline, sig)` swaps one permission for another in a single signed operation (fee charged for the new one). `replacePermissions(...)` does N→N atomically, eliminating the front-running overlap window that separate revoke + register calls would create. Both bump the manager/batch nonce epochs.

## Revocation — two levels

* **Single permission:** `revokePermission` / `revokePermissions` removes a permission, narrowing the manager's authority.
* **Whole session:** `revokeSession` sets `sessionActive = false`, blocking **all** dispatch for the account until `activateSession` (which needs a fresh signature, proving the key is still controlled).

Both take effect in a single block and **invalidate every outstanding manager-signed dispatch** that predates them (via the nonce-epoch bump). Revocation is intentionally available **even while the protocol is paused**, so owners can always reduce exposure.

## Manager rotation

The Safe itself (`msg.sender == account`) calls `setManager(newManager)`. Rotation **clears the entire permission set atomically** — no mandate silently carries over to a new manager — and bumps the manager/batch nonce epochs to invalidate anything the old manager pre-signed. The owner then re-registers each permission for the new manager. Rotation is exempt from the pause (key loss is exactly when recovery must remain possible) and moves no funds.

## Fee policy changes

`setFeePolicy(account, newFeePolicy, feeAsset, deadline, sig)` updates the account's fee policy and canonical fee asset. The new policy must be on governance's `trustedFeePolicy` allowlist. Setting `newFeePolicy = address(0)` clears it (allowed even while paused, so a compromised policy can be disarmed) and blocks fee collection.

## A note on upgradeable permissions

The kernel binds authorization to a permission **address**. If a registered permission is an upgradeable proxy, changing its implementation requires **no new kernel signature**. Register only non-upgradeable or audited permission contracts. (See whitepaper §8.2 and [Security → limitations](../security/limitations.md).)
