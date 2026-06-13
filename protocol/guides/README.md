# Guides

Hands-on walkthroughs, each grounded in the real on-chain signatures. Follow them in order for an end-to-end path from nothing to a running, bounded agent — or jump to the one you need.

1. [Write your first permission](write-a-permission.md) — a minimal `IPermission`, line by line.
2. [Deploy an SMA](deploy-an-sma.md) — create a Safe with the kernel enabled, and derive its deterministic address.
3. [Register a mandate & appoint a manager](register-a-mandate.md) — sign and submit permission registration.
4. [Dispatch a transaction within bounds](dispatch.md) — execute a call, and see what a denial looks like.
5. [Use a shared template](use-a-template.md) — configure `SharedBoundedSwapPermission` end to end.

{% hint style="info" %}
These guides show the **protocol-level** mechanics (raw EIP-712 + contract calls). If you'd rather drive all of this from a TypeScript SDK and CLI — with signing, nonce handling, and deployment registries done for you — see the **Sailor** section. Sailor wraps exactly these flows.
{% endhint %}

All examples target a kernel already deployed at the address in [Reference → Deployment addresses](../reference/addresses.md). EIP-712 domain: `name = "SailKernel"`, `version = "1"`, `verifyingContract =` the kernel, `chainId =` your chain.
