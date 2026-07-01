# Terms of Use

**Last updated: July 1, 2026**

These Terms of Use ("Terms") govern your access to and use of this website and its documentation (the "Site"), published by **Agentic Finance Inc.**, a Wyoming corporation (EIN 32-0822535), 1021 E Lincolnway #8932, Cheyenne, WY 82001, United States ("Agentic Finance," "we," "us," or "our"). By accessing the Site, you agree to these Terms. If you do not agree, do not use the Site.

{% hint style="info" %}
These Terms cover the **Site and documentation**. They do **not** govern the open-source software itself — your rights in the software come from its open-source license (see [§3](#id-3-the-software-is-open-source-license-carve-out) and [Open-Source Licenses](open-source-licenses.md)) — and they are not a contract for us to provide you any service.
{% endhint %}

## 1. What Sail is, and what we do not do

Agentic Finance publishes two open-source products:

* **Sail Protocol** — autonomous, permissionless smart-contract infrastructure for onchain separately managed accounts (SMAs), deployed to public blockchains.
* **Sailor** — an open-source TypeScript toolkit, CLI, and SDK that **you run yourself** to operate the protocol and run your own agents.

We are a **software publisher — not an operator, custodian, broker, dealer, exchange, money transmitter, investment adviser, or intermediary.** We do not, and cannot:

* hold, custody, or control your assets, private keys, wallets, or accounts;
* operate accounts, execute transactions, or run agents on your behalf;
* run any hosted interface, back-end, or service through which you transact.

Once deployed, the protocol runs autonomously on public blockchains, without us. Sailor runs on your own machine. Anyone may deploy an SMA (a self-custodial [Safe](https://safe.global) that you alone control), write and register their own permission contracts and mandates, and appoint their own manager or agent.

## 2. Our limited relationship to the protocol (fees and governance)

For accuracy, and without contradicting Section 1: while we do **not** custody assets or operate accounts, Agentic Finance **does** (a) receive protocol fees paid through the protocol's autonomous, on-chain fee mechanism, and (b) currently hold governance rights over certain tunable protocol parameters, exercisable only through an on-chain 48-hour timelock and bounded by immutable constitutional caps.

Receiving protocol fees and holding bounded, timelocked governance is **not** custody of your assets, operation of your account, or execution of your transactions, and nothing in this Section makes us a party to your transactions, your fiduciary, or your counterparty. Protocol fees are set to zero at launch and are capped by the protocol's immutable limits.

## 3. The software is open source (license carve-out)

The **software** is licensed to you under its open-source license, **not** under these Terms:

* **Sail Protocol** — **GPL-2.0-or-later** for the kernel and core contracts, and **MIT** for the interface files;
* **Sailor** — **MIT**.

Your use, copying, modification, and distribution of that software are governed **solely** by those licenses (see [Open-Source Licenses](open-source-licenses.md)). **Nothing in these Terms limits, conditions, or revokes any right those licenses grant, and nothing here adds any warranty, obligation, or restriction to the software beyond what those licenses state.** If these Terms and an open-source license conflict as to the software, the open-source license controls.

## 4. No advice; no fiduciary or advisory relationship

The Site and documentation are provided for general information only. Nothing on the Site is investment, financial, legal, tax, or accounting advice, or a recommendation or solicitation to buy, sell, deposit, delegate, or otherwise transact in any digital asset or position. We are not your broker, agent, adviser, custodian, or fiduciary, and your use of the Site or the software creates no such relationship.

## 5. Assumption of risk; your responsibilities

You are solely responsible for your use of the protocol and the software, including:

* **Your keys and custody.** You control your Safe and your keys. If you lose them, we cannot recover them or your assets.
* **Your permissions and mandates.** You deploy and register your own permission contracts and mandates, and **their correctness is your responsibility.** A permission that authorizes a harmful call will be executed by the protocol; the protocol enforces the bounds you set, not the bounds you intended.
* **Your manager/agent.** You choose, configure, and run your own manager or agent, and you are responsible for its behavior.
* **Fees and NAV.** The reference fee policy relies on manager-attested net asset value; a manager operating capital it does not own could misreport it. Allocating to a manager you do not control warrants independent diligence on that manager, its fee policy, and its registered permissions.
* **Blockchain, smart-contract, and off-chain risk**, including bugs, exploits, oracle or venue failures, network conditions, and the total loss of assets. The trusted core is under an ongoing external audit and is not final.
* **Compliance.** You are solely responsible for compliance with all laws and regulations applicable to you, including whether you are permitted to use the software in your jurisdiction.

Fuller detail is in the [Disclaimer & Risks](disclaimer.md).

## 6. Eligibility and prohibited use

You may not use the Site if applicable law bars you from doing so, or if you are the subject of economic or trade sanctions (including those administered by the U.S. Office of Foreign Assets Control) or are located in a comprehensively sanctioned jurisdiction. You may not use the Site to violate any law or to infringe the rights of others.

## 7. Third-party services

The protocol and Sailor interact with third-party software and services that you choose — for example [Safe](https://safe.global), RPC providers, DeFi venues, wallet software, and MCP clients. We do not control and are not responsible for third-party services, and your use of them is subject to their own terms.

## 8. Intellectual property and the "Sail" name

Site content is owned by Agentic Finance or its licensors. "Sail," "Sailor," and related names and logos are trademarks of Agentic Finance Inc.; these Terms grant you no right to use them. The open-source licenses grant rights to the **code**, not to our trademarks.

## 9. Disclaimers

THE SITE AND DOCUMENTATION ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING ANY WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR ACCURACY. The software's own warranty disclaimer is contained in its open-source license.

## 10. Limitation of liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, AGENTIC FINANCE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, OR FOR ANY LOSS OF PROFITS, DATA, OR DIGITAL ASSETS, ARISING FROM OR RELATING TO THE SITE, THE DOCUMENTATION, OR THE SOFTWARE. OUR TOTAL AGGREGATE LIABILITY WILL NOT EXCEED THE GREATER OF (A) THE FEES YOU PAID US, IF ANY, OR (B) US $100.

## 11. Indemnification

To the extent permitted by law, you will indemnify and hold harmless Agentic Finance from claims, losses, and expenses arising out of your use of the Site or the software or your violation of these Terms.

## 12. Governing law; dispute resolution

These Terms are governed by the laws of the State of Wyoming, United States, without regard to its conflict-of-laws rules. Any dispute arising out of or relating to these Terms or the Site will be resolved by **binding arbitration on an individual basis**. **To the extent permitted by law, you and we waive any right to a jury trial and any right to participate in a class action or class-wide arbitration.** Nothing in this Section waives any right that cannot be waived under applicable law.

## 13. Changes; miscellaneous

We may update these Terms; changes take effect when posted with a new "last updated" date. If any provision is held unenforceable, the remaining provisions stay in effect. These Terms are the entire agreement between you and us regarding the Site.

## Contact

Agentic Finance Inc., 1021 E Lincolnway #8932, Cheyenne, WY 82001, United States — **hello@sail.money**.
