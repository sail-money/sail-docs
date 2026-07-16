# Security

Sailor is **off-chain tooling for an on-chain trust model.** Nothing Sailor does can exceed what the contracts allow — the security guarantees live on-chain in [Sail Protocol](../protocol/security/README.md); Sailor makes them operable. This page states Sailor's own posture honestly; it does not restate the protocol's guarantees.

## The boundary

Sailor can *propose* and *submit* transactions; only the kernel and the owner-signed mandate decide what *executes*. So a compromised or buggy agent is bounded by contracts it cannot edit, and the worst case off-chain is a **skipped or reverted** transaction — never an out-of-mandate one. See [Sailor & the Protocol](concepts/protocol-mapping.md) and [On-chain vs off-chain](concepts/on-chain-off-chain.md).

## What Sailor does for your safety

* **The kernel evaluates the named permission on every call.** The agent signs a dispatch that names one registered permission; the kernel consults exactly that permission and executes only on `true`. A permission that returns false, reverts, or exceeds its gas cap is a denial — **fail-closed**.
* **The owner key is never read by Sailor.** Mandate registration, configuration, and revocation require a deliberate EIP-712 signature from the owner/permission signer in the browser [signing server](dashboard.md) — Sailor only records the owner address and requests signatures.
* **The manager (agent) key is encrypted on disk** — geth keystore v3 (scrypt + aes-128-ctr) under `.sail/keys/`, behind a passphrase (or `SAIL_PASSPHRASE` for non-interactive use). It is never transmitted and never baked into the Docker image.
* **The session can be paused instantly** — `sailor session pause` (or the dashboard) revokes the agent's dispatch rights without touching Safe custody; `resume` restores it. Independently, `sailor mandate revoke` removes permissions with an owner signature.
* **Off-chain dispatch resolution mirrors the kernel.** Before submitting, Sailor resolves which registered permission authorizes a planned call (including the live registration epoch) and **skips** anything nothing authorizes, logging it to `.sail/activity.jsonl` as `dispatch_denied` — never sending it.
* **All addresses are EIP-55 normalized** before any on-chain call or state write.

## Prove the bounds before you run

The fail-closed guarantee is testable before anything is at risk. `sailor mandate simulate` probes a permission's real `evaluate()` off-chain (an `eth_call` — no gas, no signing) and prints `PASS` / `FAIL` / `REVERT`; `--expect` makes a mismatch exit non-zero, so you can wire it into CI. See [Simulate before going live](guides/simulate.md).

## Reporting & the protocol review

* **Sailor (off-chain harness)** vulnerability reports: **hello@sail.money** (see the repo's [SECURITY.md](https://github.com/sail-money/Sailor/blob/main/SECURITY.md)).
* **Smart-contract issues** go to the [protocol's security policy](https://github.com/sail-money/Protocol/blob/main/SECURITY.md).

The Sail Protocol trusted core and its seven shared permission templates underwent an AI **security review** by [Octane](https://www.octane.security); the final analysis identified no critical- or high-severity findings, and the reports live in the [protocol repo's docs/security](https://github.com/sail-money/Protocol/tree/main/docs/security) (see [Protocol → Octane security review](../protocol/security/audits.md)). **That review covers the protocol contracts — not this harness.** A security review is not a guarantee of correctness; size your exposure accordingly.