# Fee model

The protocol has exactly two fee mechanisms. Each is bounded by an **immutable constitutional cap** and is **zero at launch**. Strategy-level fees (management/performance) are a separate, optional layer that lives in the fee policy.

## Fee 1 — Permission registration fee

A flat ETH fee charged each time a permission is registered, paid to the protocol treasury:

```
total fee = permissionRegistrationFee × n_permissions
```

* Bounded by the immutable cap `MAX_PERMISSION_FEE_WEI`, which is itself capped at **0.001 ETH** in the `SailGovernance` constructor.
* The active rate (`permissionRegistrationFee`) is governance-tunable within that cap, via the 48-hour timelock.
* **Zero at launch.** Excess `msg.value` is refunded to the submitter.
* Denominated in native ETH, no oracle dependency; governance retunes as ETH price moves.

## Fee 2 — Protocol cut on manager-collected fees

When the manager collects its fee via `collectFees`, the kernel splits the gross amount:

```
protocolCut    = grossFee × currentProtocolCutBps / 10_000
remainder      = grossFee − protocolCut
distributorCut = remainder × distributorBps / 10_000   (0 if distributor == address(0))
managerTake    = remainder − distributorCut
```

* `currentProtocolCutBps` is bounded by the immutable cap `MAX_PROTOCOL_CUT_BPS = 2500` (**25%**) and is **zero at launch**.
* The fee **recipient is pulled from the policy** (`IFeePolicy.feeRecipient()`), not from the caller — a compromised manager cannot redirect fees.
* `distributorBps` is validated `<= 10_000` (`DistributorBpsTooLarge` otherwise).
* `collectFees(account, grossFee, currentNav, feeToken)` may be called by the manager, the Safe itself, or the permission signer (a backstop against fee-starvation). `feeToken` must equal the account's configured `feeAsset`. State is recorded **before** transfers (CEI); transfers go out of the Safe via the module path, atomically.

## IFeePolicy

The kernel delegates fee *computation* to a policy contract on governance's `trustedFeePolicy` allowlist:

```solidity
interface IFeePolicy {
    function feeRecipient() external view returns (address);
    function computeFee(address account, uint256 currentNav)
        external view returns (uint256 grossFee, address distributor, uint256 distributorBps);
    function recordCollection(address account, uint256 grossFee, uint256 currentNav) external; // onlyKernel
}
```

The kernel enforces `grossFee <= computeFee(...).grossFee` — the policy sets the ceiling; the kernel enforces it.

## StandardFeePolicy — the reference 2-and-20

`StandardFeePolicy` implements a classic schedule:

```
managementFee  = currentNav × managementFeeBps × elapsed / (365 days × 10_000)
performanceFee = max(currentNav − HWM, 0) × performanceFeeBps / 10_000
grossFee       = managementFee + performanceFee
```

* After each collection the **high-water mark** updates to `max(HWM, currentNav)` — performance fees are charged only on new all-time highs.
* Rate caps: management `<= 1000` bps (10%/yr), performance `<= 5000` bps (50%), distributor `<= 10000` bps.
* A **minimum 1-day collection interval** prevents management-fee timer manipulation via rapid calls.
* The HWM must be **explicitly seeded** by the fee manager (`seedHighWaterMark`) before any collection — this blocks a manager from seeding HWM at 0 and claiming a performance fee on the whole portfolio on the first call.
* Rate changes are **prospective**: each account snapshots the applied rates at collection time, so a rate change never reprices a past period.
* `feeRecipient()` returns the `feeManager`. Fee-manager control transfers two-step (`proposeFeeManager` → `acceptFeeManager`).

{% hint style="info" %}
**NAV is manager-attested.** `currentNav` is supplied by the manager and is **not** independently verified on-chain. `StandardFeePolicy` trusts it; strategies that need trustless fee computation should use an oracle-backed policy instead. See [Security → limitations](../security/limitations.md).
{% endhint %}

A custom policy need only implement `IFeePolicy`, be added to the `trustedFeePolicy` allowlist by governance, and (if it needs validated NAV) read an oracle inside `computeFee` rather than trusting the manager's value.
