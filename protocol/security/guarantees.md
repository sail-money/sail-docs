# Guarantees

The protocol provides six guarantees as properties of the **deployed bytecode** — they hold regardless of what any permission or fee policy does.

### 1. Custody isolation

The kernel cannot transfer Safe assets except through a manager dispatch that satisfies the named permission's evaluation. The kernel has no direct write access to the Safe outside the module dispatch path, and a dispatch whose `target` is the Safe itself is rejected (`AccountSelfTarget`) — blocking module-triggered self-reconfiguration.

### 2. Selective authorization

A dispatch succeeds only if the permission named in the manager's signature is registered for the account **and** returns true on evaluation. An unregistered permission reverts before evaluation (`PermissionNotRegistered`); there is no implicit allow-all state (deny-by-default).

### 3. Reentrancy safety

Permission evaluation occurs via `staticcall`, which prohibits state mutation — no re-entry path exists through the permission surface. The kernel's state-changing entry points are additionally `nonReentrant`.

### 4. Gas isolation

Each permission is called under a fixed gas cap (`PERMISSION_GAS_CAP = 150_000`; `BATCH_EVAL_GAS_CAP = 1_000_000` for batches). Exceeding it is treated as returning false. A malicious permission cannot deny service to the kernel or drain the manager's gas budget beyond the cap.

### 5. Constitutional fee caps

The protocol cut (`MAX_PROTOCOL_CUT_BPS = 2500`) and registration fee (`MAX_PERMISSION_FEE_WEI ≤ 0.001 ETH`) cannot be exceeded under any governance procedure — they are immutable. Both are zero at launch.

### 6. Signer separation

The Permission Signer cannot move Safe assets (it never signs a dispatch). The Manager cannot register or revoke permissions (it never signs a registry op). The Safe owner can always revoke the manager (`setManager`) and can remove the kernel module entirely.

## Supporting mechanisms

These reinforce the six guarantees:

* **Fail-closed evaluation** — any false/revert/OOG/malformed return reverts the whole dispatch.
* **Nonce-epoch invalidation** — any restrictive signer op or manager rotation bumps the manager/batch nonce epoch (`1 << 128`), invalidating all of the manager's outstanding pre-signed dispatches.
* **Front-run-resistant account creation** — the CREATE2 salt binds the principals, so a counterfactual SMA address cannot be claimed with different principals.
* **Trusted-component allowlists** — only allowlisted Safe factories, singletons, module-setup helpers, proxy codehashes, and fee policies can be used, blocking attacker-supplied setup delegatecalls (Octane #1) and metamorphic fee policies.
* **Three nonce namespaces** — dispatch, batch, and signer operations cannot replay across each other.
* **Emergency pause** that still permits de-risking operations (revoke, rotate) while blocking value movement.

Several of these correspond to findings raised in the ongoing audit (e.g. Octane #1, #4/#4a/#4b, #7, #16) and are addressed in the deployed bytecode. See [Audits](audits.md).
