# Keys & custody

Sailor operates the Protocol's [three roles](../../protocol/concepts/roles.md). Each maps to a key Sailor handles differently — and the differences are the heart of the safety model.

| Role | Key | Where it lives | Who signs with it |
| --- | --- | --- | --- |
| **Owner** | Your wallet (MetaMask, Rabby, …) | Your browser wallet — **never read by Sailor** | You, in the browser signing station |
| **Permission Signer** | Same as owner, or a separate signer | Your wallet / signer | You, authorizing mandate operations |
| **Manager** (agent) | The agent wallet | `.sail/keys/manager.json`, encrypted (geth keystore v3) | Sailor, automatically, per dispatch |

## The owner key is never in the terminal

Owner and permission-signer signatures (creating the SMA, registering or revoking permissions) are deliberate, custody-affecting actions. Sailor routes them through a local **signing station** — an HTTP + WebSocket daemon that serves a browser UI:

```bash
sailor station start &     # the signing daemon
sailor owner connect       # connect your wallet in the browser, persist it as owner
```

The agent (and any coding assistant operating Sailor) **never holds the owner key**. It pushes signing requests to the station; you approve them in the browser; then the agent submits the transactions it's allowed to. This is why a coding agent can drive setup without ever being trusted with custody.

## The manager key is encrypted and scoped

The manager (agent) key is generated with `sailor keys generate` and stored encrypted at `.sail/keys/manager.json` (scrypt + aes-128-ctr). It signs dispatches — and **only** dispatches. By the [signer-separation guarantee](../../protocol/security/guarantees.md), the manager cannot register or revoke permissions and cannot exceed any registered permission's bounds. Unlock it non-interactively (CI, headless runs) by setting `SAIL_PASSPHRASE`; never commit it.

Addresses passed to the CLI are normalized to EIP-55 checksum before any on-chain call or state write.

## Custody never leaves the Safe

Capital is held in the owner's Safe. Sailor cannot move it except through a manager dispatch that satisfies a registered permission — and even then the funds move via the Safe's own module path, not through Sailor. You can sever the agent instantly without touching custody:

```bash
sailor session pause       # revoke dispatch rights; sailor session resume to restore
```

Pausing the session blocks every dispatch while leaving the Safe, its balances, and the mandate intact. Rotating the agent key (`sailor account rotate-signer`) clears the mandate and re-approves it for the new key — see [Accounts & keys](../cli/accounts.md).

{% hint style="info" %}
Custody is protected by construction, but **a mandate is only as correct as its permission contracts**. The key model prevents the agent from exceeding the mandate; it does not make a permissive mandate safe. See [Build & register a mandate](../guides/build-a-mandate.md) and the Protocol's [security limitations](../../protocol/security/limitations.md).
{% endhint %}
