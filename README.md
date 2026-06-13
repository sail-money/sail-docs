---
description: Onchain separately managed accounts, run by agents.
cover: .gitbook/assets/sail-logo.png
coverY: 0
layout:
  cover:
    visible: true
    size: hero
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

# Sail Documentation

Sail is a protocol for **onchain separately managed accounts (SMAs)**. Capital stays in a self-custodial [Safe](https://safe.global) owned by the LP. A designated manager — typically an autonomous agent — executes transactions within a **mandate** enforced by smart contracts on every dispatch. The manager never takes custody; it holds a cryptographic authorization that the kernel checks against the account's registered permissions at execution time.

{% hint style="info" %}
**Are you an LLM or coding agent?** Read [llms.txt](https://docs.sail.money/llms.txt) for a structured summary of these docs, or [llms-full.txt](https://docs.sail.money/llms-full.txt) for the full context.
{% endhint %}

## Choose your path

These docs split into two sections. Pick the one that matches what you're building.

{% content-ref url="protocol/" %}
[protocol](protocol/)
{% endcontent-ref %}

**Protocol** — Build directly on the smart contracts. Write permission contracts, deploy SMAs, appoint managers, and integrate the kernel. For developers working in Solidity and against the on-chain ABIs.

{% content-ref url="sailor/" %}
[sailor](sailor/)
{% endcontent-ref %}

**Sailor** — Operate mandated agents with the toolkit. A TypeScript SDK and CLI that wrap SMA creation, mandate signing, and dispatch — driven by your coding agent. For developers shipping a strategy agent without touching the kernel directly.

## Which one do I need?

| You want to… | Go to |
| --- | --- |
| Write Solidity permission contracts, or integrate `SailKernel` / `MandateFactory` from your own code | **Protocol** |
| Ship an agent that runs a strategy on an SMA, using a ready-made SDK + CLI | **Sailor** |
| Understand the security model, fees, or governance before building | **Protocol → Concepts / Security** |

## Resources

* [Deployment addresses](protocol/reference/addresses.md) — the trusted core, identical on every supported chain
* [Protocol repository](https://github.com/sail-money/Protocol) · [Sailor repository](https://github.com/sail-money/Sailor)
* [Whitepaper](https://github.com/sail-money/Protocol/blob/main/docs/whitepaper/Sail_Protocol_Whitepaper.pdf)
* `llms.txt` — a machine-readable index of these docs for AI agents

***

The Sail Protocol trusted core is under an ongoing external audit by [Octane Security](https://octane.security) and is not final. Do not use it with funds you are not prepared to lose.
