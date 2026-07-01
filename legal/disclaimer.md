# Disclaimer & Risks

**Last updated: July 1, 2026**

This page explains what the Sail software is (and is not), the risks you accept by using it, and how we characterize it. It applies to both **Sail Protocol** and **Sailor**. Read it alongside the [Terms of Use](terms-of-use.md).

## No advice

Nothing published by Agentic Finance Inc. — this documentation, the whitepaper, code comments, or examples — is investment, financial, legal, tax, or accounting advice, or a recommendation, solicitation, or offer to buy, sell, deposit, delegate, or transact in any digital asset, strategy, or position. You are responsible for your own decisions and should consult your own professional advisers.

## No warranty; software provided "as is"

The software is provided **"as is," without warranty of any kind**, express or implied, including any warranty of merchantability, fitness for a particular purpose, title, or non-infringement. The authoritative warranty disclaimer for each product is the one contained in its open-source license (see [Open-Source Licenses](open-source-licenses.md)). We do not warrant that the software is free of defects, secure, or uninterrupted.

The trusted core contracts are under an **ongoing external audit and are not final.** Deployed addresses, templates, and parameters may change. Nothing here is a representation that the software is production-ready for your use.

## What we do — and do not — do

Agentic Finance **publishes open-source software and documentation.** We are a software publisher, not an operator, custodian, broker, dealer, exchange, money transmitter, or investment adviser. We do **not** custody your assets, hold your keys, operate your accounts, execute your transactions, or run any hosted service on your behalf. There is **no hosted interface** — you interact with the protocol directly, on public blockchains, using software you run yourself.

For accuracy: Agentic Finance **does** receive protocol fees through the protocol's autonomous on-chain fee mechanism and currently holds governance rights over certain tunable parameters, exercisable only through an on-chain 48-hour timelock and bounded by immutable caps. This is not custody, operation, or execution, and does not make us your counterparty or fiduciary. See [Terms of Use §2](terms-of-use.md#id-2-our-limited-relationship-to-the-protocol-fees-and-governance).

## Terminology is descriptive, not a legal or regulatory characterization

Terms used in our documentation and code — such as "manager," "agent," "mandate," "separately managed account" or "SMA," "fees," "governance," "custody," and "delegation" — are used **in their plain, technical, descriptive sense to explain how the software works.** They are **not** intended to characterize the software, any transaction, or any party under the securities, commodities, banking, money-transmission, investment-adviser, or other laws or regulations of any jurisdiction, and they should not be read as claiming or implying any regulated status. Whether any activity you conduct with the software is regulated depends on your facts and your jurisdiction, and is your responsibility to determine.

## Risks you accept

Using the software involves significant risk, including the **total loss of your assets.** Among others:

* **Key and custody risk.** You alone control your Safe and keys. Lost keys mean lost assets; we cannot recover them.
* **Permission and mandate risk.** You author, deploy, and register your own permission contracts and mandates. The protocol enforces the bounds you actually set — not the bounds you intended. A permission that authorizes a harmful call will be executed. Their correctness is your responsibility.
* **Manager / agent risk.** You choose, configure, and run your own manager or agent and are responsible for its behavior. Allocating capital to a manager you do not control carries counterparty and misbehavior risk.
* **NAV-reporting risk.** The reference fee policy relies on **manager-attested** net asset value; a manager operating capital it does not own could misreport it, affecting fee calculations.
* **Smart-contract risk.** Bugs, vulnerabilities, and exploits can cause loss, including in audited code. The core is not final.
* **Blockchain and market risk.** Network congestion, reorgs, failed or front-run transactions, oracle failures, venue or liquidity failures, and asset price volatility can all cause loss.
* **Third-party risk.** RPC providers, DeFi venues, [Safe](https://safe.global), wallets, and other third-party services have their own risks and terms.
* **Regulatory and compliance risk.** Laws affecting digital assets are evolving. You are solely responsible for determining and meeting your legal and regulatory obligations, and for confirming you are permitted to use the software in your jurisdiction.
* **No recovery, no reversal.** On-chain transactions are generally irreversible. There is no help desk, no chargeback, and no one who can reverse a transaction for you.

## Your responsibility and eligibility

You are solely responsible for your use of the software, for securing your keys and systems, and for compliance with all laws applicable to you. You must not use the software if you are barred by applicable law or are subject to economic or trade sanctions (including OFAC-administered sanctions) or located in a comprehensively sanctioned jurisdiction.

## No liability

To the maximum extent permitted by law, Agentic Finance is not liable for any loss arising from or relating to the software, including loss of assets. See the [Terms of Use §10](terms-of-use.md#id-10-limitation-of-liability) for the limitation of liability.

## Trademarks

"Sail" and "Sailor" are trademarks of Agentic Finance Inc. The open-source licenses grant rights to the code, not to our names or logos.

## Contact

Questions about this notice: **hello@sail.money**.
