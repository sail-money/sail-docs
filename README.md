---
description: Onchain Separately Managed Accounts Run By Agents
layout:
  cover:
    visible: false
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: false
  pagination:
    visible: false
---

# Sail.Money

Sail is an AI lab pioneering personalized finance. Pick the path that matches what you're doing:

<table data-view="cards"><thead><tr><th></th><th></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td><strong>Sailor</strong></td><td><strong>For AI agent builders.</strong> Turn any coding agent into a money agent. The open-source harness that deploys your SMA, builds your permissions, and runs your strategy on your own machine. Works with npm or Docker.</td><td><a href="sailor/README.md">sailor/README.md</a></td></tr><tr><td><strong>Protocol</strong></td><td><strong>For developers and asset managers.</strong> The first onchain primitive for separately managed accounts: personalized, non-custodial capital delegation to a manager. Write permission contracts, deploy SMAs, appoint managers, and integrate the kernel.</td><td><a href="protocol/README.md">protocol/README.md</a></td></tr></tbody></table>

Both products — the Protocol and Sailor — are **fully open source**, free to read, fork, and build on.

## Which one do I need?

| You want to… | Go to |
| --- | --- |
| Ship an agent that runs a strategy on an SMA, using a ready-made SDK + CLI | **Sailor** |
| Write Solidity permission contracts, or integrate `SailKernel` / `MandateFactory` from your own code | **Protocol** |
| Understand the security model, fees, or governance before building | **Protocol → Concepts / Security** |

## For coding agents

{% hint style="info" %}
**Are you an LLM or coding agent?** Grab the ready-made prompt and machine-readable `llms.txt` context to get building fast. See [For AI agents](for-ai-agents.md).
{% endhint %}

## Resources

* [Deployment addresses](protocol/reference/addresses.md) — the trusted core, identical on every supported chain
* [Protocol repository](https://github.com/sail-money/Protocol) · [Sailor repository](https://github.com/sail-money/Sailor)
* [Whitepaper](https://github.com/sail-money/Protocol/blob/main/docs/whitepaper/Sail_Protocol_Whitepaper.pdf)
* `llms.txt` — a machine-readable index of these docs for AI agents
* [Legal](legal/README.md) — terms, privacy, disclaimer & risks, and open-source licenses
* **Community** — [Discord](https://discord.gg/9GsxPsHzRv) · [X](https://x.com/SaildotMoney) · [GitHub](https://github.com/sail-money) · [npm](https://www.npmjs.com/package/@sail.money/sailor)

## Open source & reviewed

Both **Sail Protocol** and **Sailor** are fully open source — read, fork, and build on every line. See the [Protocol repository](https://github.com/sail-money/Protocol/) and the [Sailor repository](https://github.com/sail-money/Sailor).

The trusted core and the shared permission templates as they stood at the review were reviewed by [Octane](https://www.octane.security), an AI source-code security scanner, across three analyses; the later `WithdrawPermission` v2 rewrite is not covered. See [Protocol → Security](protocol/security/README.md).

***

A security review is not a guarantee of correctness, and the correctness of any permission you deploy remains your responsibility. Do not use Sail with funds you are not prepared to lose. See the [Disclaimer & Risks](legal/disclaimer.md).
