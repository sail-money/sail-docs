# Security

Sail's security model is "a small trusted core that contains an open periphery." Read it in three parts:

* [Guarantees](guarantees.md) — the six properties the deployed bytecode provides.
* [Limitations](limitations.md) — what the protocol does **not** protect against, stated plainly.
* [Octane security review](audits.md) — the three AI source-code security analyses, and how to report a vulnerability.

To report a vulnerability: **security@sail.money**.

{% hint style="warning" %}
The trusted core and shared templates are deployed on 11 chains (9 mainnets + 2 testnets) and were reviewed by [Octane](https://www.octane.security), an AI source-code security scanner, across three analyses; the final analysis found no critical- or high-severity findings. A security review is not a proof of correctness — do not use with funds you are not prepared to lose.
{% endhint %}
