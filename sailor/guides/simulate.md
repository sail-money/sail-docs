# Simulate before going live

`sailor mandate simulate` probes a permission **off-chain** (`eth_call`, no gas) so you can prove it accepts the calls you want and rejects the ones you don't — before authorizing it on-chain or running the agent. This is the single most useful safety step in the Sailor workflow.

## Single call

```bash
sailor mandate simulate \
  --address MyPermission \      # required: address or tracked name
  --sma 0xYourSMA \             # probe as this account (ctx.account); defaults to .sail/account.json
  --target 0xRouter \           # the call target
  --calldata 0x414bf389... \    # 0x-prefixed calldata
  --value 0 \                   # ETH value in wei (default 0)
  --expect pass \               # expected outcome: pass | fail (sets a non-zero exit on mismatch)
  --label "swap usdc->weth"     # human-readable label
```

The command builds a `Context` for the named permission and calls its `evaluate` via `eth_call`. It reports one of:

* **PASS** — the permission returned true; this call would be allowed.
* **FAIL** — the permission returned false; this call would be denied (fail-closed).
* **REVERT** — `evaluate` reverted (treated by the kernel as denial).

`--expect pass|fail` makes the command exit non-zero on a mismatch, so you can assert behavior in scripts and CI.

## Batch

Probe many calls at once with a JSON file:

```bash
sailor mandate simulate --address MyPermission --sma 0xYourSMA --calls ./samples.json
```

```json
[
  { "target": "0xRouter", "calldata": "0x414bf389...", "value": "0", "expect": "pass", "label": "in-bounds swap" },
  { "target": "0xRouter", "calldata": "0x...big...",   "expect": "fail", "label": "over the cap" },
  { "target": "0xEvil",   "calldata": "0x...",         "expect": "fail", "label": "wrong target" }
]
```

Each entry takes `target`, `calldata`, optional `value`, `expect`, and `label`. Add `--json` to the command for machine-readable results. Build your samples from the real strategy: include the calls the agent will make (expect pass) **and** the calls it must never make (expect fail).

## Where it fits

The rule the scaffold enforces — and you should too — is: **never authorize (attach) a permission before `forge test` and `sailor mandate simulate` both pass** against samples derived from your strategy. Simulation closes the gap between "the contract compiles" and "the contract bounds exactly what I intend."

You can also preview a dispatch through the SDK at runtime with `client.dispatch.preview(...)`, which runs the kernel's `previewBatch` view and returns `{ approved, reason }`. See [SailorClient](../sdk/client.md).
