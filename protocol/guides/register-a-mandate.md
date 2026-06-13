# Register a mandate & appoint a manager

The manager was appointed when the account was created (the `manager` argument to `createAccount` / `registerAccount`). The mandate — what that manager may do — is set by **registering permissions**, each authorized by the Permission Signer's EIP-712 signature.

## 1. Build the RegisterPermission signature

The type string (note the `deadline` field — current kernels include it):

```
RegisterPermission(address account,address permission,uint256 nonce,uint256 deadline)
```

Construct and sign the digest with the Permission Signer key:

```
structHash = keccak256(abi.encode(
    REGISTER_PERMISSION_TYPEHASH,
    account,
    permission,
    signerNonces[account],   // read from the kernel
    deadline
))
digest = kernel.hashTypedDataV4(structHash)   // applies the SailKernel domain
signerSig = sign(digest, permissionSignerKey) // ECDSA or ERC-1271
```

Read the current nonce from `kernel.signerNonces(account)`. The EIP-712 domain is `{ name: "SailKernel", version: "1", chainId, verifyingContract: kernel }`.

## 2. Submit the registration with the fee

```solidity
uint256 fee = governance.permissionRegistrationFee(); // 0 at launch
kernel.registerPermission{value: fee}(account, permission, deadline, signerSig);
```

Anyone may submit this transaction — authority is the signature, not the sender. Excess `msg.value` is refunded. The permission must be a deployed contract, not already registered, and the account must be below `maxPermissionsPerAccount` (default 20).

## Register several at once

To attach multiple permissions under a single signer nonce, sign `RegisterPermissions(address account,address[] permissions,uint256 nonce,uint256 deadline)` (the `address[]` is hashed per EIP-712 §4 — `keccak256` of the ABI-encoded, zero-padded addresses) and call:

```solidity
kernel.registerPermissions{value: fee * permissions.length}(account, permissions, deadline, signerSig);
```

## If the permission needs configuring

Shared templates must be **configured** for the account in addition to being registered. You can do both in one transaction with the `MandateFactory.attach(...)`, which calls `template.configure(...)` then `kernel.registerPermission(...)`. See [Use a shared template](use-a-template.md).

## Changing the mandate later

* **Tighten safely:** prefer `replacePermission` (atomic swap to a freshly-configured permission) over reconfiguring in place.
* **Narrow:** `revokePermission` / `revokePermissions`.
* **Stop everything:** `revokeSession` (then `activateSession` to resume).
* **Rotate the agent:** the Safe calls `setManager(newManager)` — this **clears the whole mandate** and you re-register for the new manager.

Each of these is a signed operation that consumes a `signerNonces` value and (for restrictive ops) invalidates the manager's outstanding pre-signed dispatches. See [the lifecycle](../permissions/lifecycle.md).

Now the manager can act → [Dispatch a transaction within bounds](dispatch.md).
