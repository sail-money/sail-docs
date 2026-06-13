# Audits

## Status

The Sail Protocol contracts have been submitted for audit by **[Octane Security](https://octane.security)**. The audit is **ongoing**, and findings are being addressed as they are received. Several mitigations are already reflected in the deployed bytecode and are referenced in the code and in [Guarantees](guarantees.md) — for example:

* **#1** — trusted module-setup allowlist, closing the arbitrary setup-delegatecall surface during `createAccount`.
* **#4 / #4a / #4b** — principal-bound CREATE2 salt and proxy-codehash / module-enabled checks, preventing account-registration front-running and stealth self-registration.
* **#7** — nonce-epoch invalidation of pre-signed dispatches on restrictive operations.
* **#16** — counterfactual addresses cannot be squatted with different principals.

This page will link the published report when the audit completes. Until then, treat the deployments as **staging**: they are live on six chains for testing, with zero fees and a genesis-bootstrapped allowlist, but they are **not final**.

{% hint style="warning" %}
Do not use the current deployments with funds you are not prepared to lose.
{% endhint %}

## Scope

The trusted core (`SailKernel`, `SailGovernance`, the injected `TimelockController`) is the primary audit surface. Permission templates and fee policies are **outside** the trusted core; their blast radius is bounded to the accounts that opt into them, and they are audited (or not) independently of the core.

## Reporting a vulnerability

Email **security@sail.money**. Please include enough detail to reproduce, and allow time for a fix before public disclosure. The contracts carry a `@custom:security-contact security@sail.money` tag in their source.
