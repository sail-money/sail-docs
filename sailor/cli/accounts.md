# Accounts & keys

Managing the SMA and the local signing keys.

## `sailor keys`

Manage local signing keys.

| Subcommand | Description |
| --- | --- |
| `keys generate` | Generate and encrypt an agent wallet or mandate-signer key |
| `keys show` | Show the address of each stored key |
| `keys export-ci` | Copy the encrypted agent-wallet keystore to `ci-keystore.json` for committing to CI |

Keys are stored as geth keystore v3 (scrypt + aes-128-ctr) under `.sail/keys/`. The encrypted `ci-keystore.json` is safe to commit; the raw private key is never exposed. Unlock non-interactively with `SAIL_PASSPHRASE`.

## `sailor account`

Manage the Sail SMA.

### `account predict`

Compute the deterministic Safe address for a given owner + manager + salt (no gas, no deployment).

| Option | Description |
| --- | --- |
| `--owner <address>` | Owner EOA (defaults to `.sail/account.json`) |
| `--manager <address>` | Agent (manager) wallet — mixed into the kernel salt (defaults to `.sail/account.json`) |
| `--salt <n>` | CREATE2 salt nonce (default `0`) |
| `--chain <id>` | Show the prediction for one chain only |
| `--json` | Machine-readable output |

### `account deploy-chain`

Deploy the same SMA address on an additional chain using the same owner, manager, and salt.

| Option | Description |
| --- | --- |
| `--chain <id>` | **Required.** Target EVM chain ID (e.g. `8453`, `42161`, `130`, `1`) |
| `--salt <n>` | CREATE2 salt (defaults to the `saltNonce` stored in `.sail/account.json`) |
| `--json` | Machine-readable output |

### `account rotate-signer`

Rotate the SMA's delegated signer (agent wallet) and re-approve its mandates. Rotation clears the mandate on-chain, so Sailor re-approves the previously-attached permissions for the new signer.

| Option | Description |
| --- | --- |
| `--sma <address>` | SMA to rotate (defaults to the active account) |
| `--to <address>` | Rotate to an existing agent-wallet address instead of generating one |
| `--generate` | Generate a fresh local agent wallet (default when `--to` is omitted) |
| `--skip-reattach` | Do not re-approve the previously-attached mandates |
| `--reattach-only` | Skip rotation; only re-approve mandates (resume after funding) |
| `--list` | List known agent wallets for this SMA without rotating |
| `--json` | Machine-readable output |

```bash
sailor account predict --salt 0
sailor account rotate-signer --generate
```

Rotation maps to the kernel's `setManager`, which clears the permission set and invalidates the old signer's pre-signed dispatches — see the Protocol's [permission lifecycle](../../protocol/permissions/lifecycle.md).
