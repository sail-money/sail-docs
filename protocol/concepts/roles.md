# The three roles

Sail separates three roles that exist implicitly in any managed-account structure. Keeping them distinct is what lets an agent transact without ever being able to take custody or rewrite its own mandate.

| Role | Authority | Held by | Code identifier |
| --- | --- | --- | --- |
| **Owner** | Holds the Safe. Custodies the SMA's capital. Always self-custodial. Can always revoke the manager. | The LP, who owns the Safe. | the Safe's own owners/threshold |
| **Permission Signer** | Authorizes the mandate. Signs registration, configuration, replacement, and revocation of permissions via EIP-712. | The Owner, or a separate signing key or multisig. | `AccountConfig.permissionSigner` |
| **Manager** | Executes transactions within bounds. Cannot exceed what the registered permissions allow. | EOA, multisig, MPC wallet, or autonomous agent. | `AccountConfig.manager` |

These three are stored per account in the kernel's `AccountConfig` (alongside the `feePolicy`, the canonical `feeAsset`, and the `sessionActive` flag).

## What each role can and cannot do

* The **Owner** controls the Safe and its assets directly, through the Safe's own threshold. The kernel reads custody from the Safe; it never holds funds. The Owner can rotate the manager (see below) and can remove the kernel module entirely.
* The **Permission Signer** decides *what the manager may do* by signing permission-registry operations. It **cannot move assets** — it never signs a dispatch.
* The **Manager** decides *which authorized action to take, and when*, by signing dispatches. It **cannot register or revoke permissions**, and it **cannot exceed** any registered permission's bounds.

This separation is a security property: a compromised manager key cannot widen its own mandate, and a compromised permission-signer key cannot move funds.

## The submitter is not a role

The address that pays gas and submits the manager's signed dispatch is **not** an authority. Any address may submit a dispatch; authority derives entirely from the manager's signature, the registered permissions, and the kernel's evaluation. This makes Sail natively compatible with relayers, paymasters, and ERC-4337 bundlers. The permission can still read `ctx.submitter` and gate on it if it chooses.

## Retail vs. institutional setups

* **Retail:** all three roles collapse to one key or wallet. The owner deploys a Safe, registers permissions as Permission Signer, and signs dispatches as Manager.
* **Institutional:** the roles separate. A fund firm holds the Manager key; an independent compliance officer or the client holds the Permission Signer key and controls what the manager can trade; the Safe signers (Owner) retain custody and can always revoke.

## Manager rotation

The Safe itself (`msg.sender == account`) can rotate the manager via `setManager(newManager)`. Rotation **clears every registered permission atomically** — no mandate silently transfers authority approved for the old manager to a new one — and bumps the manager nonce epoch so any dispatch the old manager pre-signed is invalidated. The owner re-approves each mandate for the new manager through the normal registration flow.

Next: how those permissions form a [mandate](mandate.md).
