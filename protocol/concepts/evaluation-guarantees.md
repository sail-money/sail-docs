# The four evaluation guarantees

Permissions are arbitrary, user-deployed Solidity. The kernel does not trust them — it *contains* them. Every permission evaluation, on every dispatch, is bounded by four structural guarantees. Together they mean the worst a buggy or malicious permission can do is **deny** calls, never widen authority or harm the kernel.

## 1. Static evaluation

Permissions are invoked via `staticcall`:

```solidity
(bool success, bytes memory ret) =
    permission.staticcall{gas: PERMISSION_GAS_CAP}(
        abi.encodeCall(IPermission.evaluate, (data, ctx))
    );
```

`staticcall` prohibits state mutation. A permission **cannot** modify any contract's storage during evaluation, and **reentrancy through the permission surface is structurally impossible** — there is no write path to re-enter.

**Protects against:** reentrancy, permissions that try to mutate state mid-evaluation, hidden side effects.

## 2. Gas isolation

Each permission is called with a fixed gas cap, `PERMISSION_GAS_CAP = 150_000`. A permission that exceeds its cap reverts and is treated as returning `false`. (Batch permissions get a larger `BATCH_EVAL_GAS_CAP = 1_000_000` because they must inspect every subcall.)

**Protects against:** a pathological permission denying service to the kernel or burning the manager's entire gas budget. The cap bounds the cost of evaluation no matter what the permission does.

## 3. Selective authorization

The manager's signature names **one** registered permission. The kernel evaluates that permission alone; no other registered permission is consulted. The named permission must be registered on the account — registration is the Permission Signer's trust anchor.

**Protects against:** unrelated permissions falsely denying each other, and lets one account hold many independent mandates. See [the mandate](mandate.md).

## 4. Fail-closed

Any permission that returns `false`, reverts, runs out of gas, or returns malformed data causes the **entire dispatch to revert**. There is no partial-allow path, and an account with no registered permissions cannot dispatch at all (deny-by-default). The kernel decodes the return as a `uint256` and requires it to equal `1`, so a non-canonical boolean word is treated as denial, not acceptance.

**Protects against:** a buggy permission accidentally allowing a call. The default behavior of anything that goes wrong is to deny.

***

These four properties protect the kernel *from* the permission. Everything a permission expresses **inside** that envelope — which tokens, which venues, what amounts — is the permission author's responsibility. That division is what makes the kernel auditable in isolation and the permission set permissionlessly extensible. See [full expressiveness](../permissions/expressiveness.md).
