# Shared multi-tenant templates

The naive pattern — one permission contract per account, parameters in the constructor — gives a clean per-instance audit surface but is expensive in gas and bytecode. Sail's **recommended** pattern is the **shared multi-tenant template**: one contract deployed once per chain, serving every account that registers it, with per-account configuration stored in mappings keyed by `account`.

## BaseSharedPermission

Shared templates inherit `BaseSharedPermission`, which provides the per-account configuration machinery so subclasses only implement their decode/check logic.

```solidity
abstract contract BaseSharedPermission is
    IConfigurablePermission, IAccountAgentIdentityResolver, EIP712, ReentrancyGuard
{
    bytes32 public constant CONFIGURE_TYPEHASH =
        keccak256("Configure(address account,bytes32 paramsHash,uint256 nonce,uint256 deadline)");

    mapping(address => uint256) public configNonces;
    mapping(address => bool)    public isConfigured;

    function _applyConfig(address account, bytes calldata params) internal virtual; // subclass hook
}
```

It exposes two ways to configure an account, both reading the authoritative `permissionSigner` from the kernel:

* `configure(account, params, deadline, sig)` — anyone may submit; authorization is the Permission Signer's EIP-712 signature over `Configure(account, keccak256(params), nonce, deadline)`. The per-account `configNonces` is incremented only **after** the signature verifies.
* `configureDirect(account, params)` — `msg.sender` must equal the account's `permissionSigner` (useful when the signer is an EOA submitting the tx itself).

A fresh `configure` clears the account's previous config and applies the new one atomically.

## The opaque params blob

`params` is an ABI-encoded blob whose structure each template defines. The kernel and the base contract treat it as opaque bytes; the subclass decodes it in `_applyConfig`. For `SharedBoundedSwapPermission`, for example:

```solidity
abi.encode(
    address[] routers,
    address[] tokensIn,
    address[] tokensOut,
    uint256   maxAmountPerTx,
    uint256   maxSlippageBps,
    address   priceOracle,
    uint256   maxPriceAgeSec
)
```

The template decodes this, validates it (e.g. an oracle requires a non-zero freshness bound, else `MissingPriceAge`), rebuilds its O(1) allowlist mappings for that account, and stores the slot.

## Starter catalog

A set of shared templates ships with the protocol as demonstrations of the pattern — **unaudited references**, not part of the trusted core. Each declares a capability id from `SailCapabilities`:

| Template | Gates | Capability |
| --- | --- | --- |
| `SharedBoundedSwapPermission` | AMM swaps: router + token allowlists, per-tx amount cap, optional oracle slippage check (Uniswap V3 `exactInputSingle` V1/V2, V2 `swapExactTokensForTokens`). | `bounded-swap.v1` |
| `SharedBoundedBorrowPermission` | Borrows on Aave V3 / Morpho / Compound with LTV enforcement. | `bounded-borrow.v1` |
| `SharedTransferTargetPermission` | ERC-20 `transfer`/`transferFrom` to allowlisted recipients. | `transfer-target.v1` |
| `SharedDeFiBundlePermission` | Composite swap + borrow + transfer, selector-routed. | `defi-bundle.v1` |
| `SharedPendlePermission` | Pendle V2 Router V4: liquidity, PT/YT swaps, mint/redeem, claim. | `pendle-yield.v1` |
| `SharedAMMLiquidityPermission` | Concentrated-liquidity ops on Uniswap V3 / Aerodrome. | `amm-liquidity.v1` |
| `SharedApproveAndCallBatchPermission` | Batch-only: the `approve → call → reset` pattern. | `batch-dispatch.v1` |

{% hint style="warning" %}
Templates are demonstrations of the pattern, not the protocol. They are **unaudited** and, as of this writing, **not yet deployed against the current kernel** on any chain. Treat them as reference implementations to read, adapt, and deploy yourself. Anyone may deploy additional templates for any venue.
{% endhint %}

## Standalone (clone) templates

Some templates are single-account and use `initialize(...)` instead of `configure(...)`. The `MandateFactory.deployAndAttach` flow clones such a logic contract (EIP-1167), initializes it, and registers the clone — one transaction, deterministic address. See [MandateFactory](../architecture/mandate-factory.md).

Configure one end to end in [Use a shared template](../guides/use-a-template.md).
