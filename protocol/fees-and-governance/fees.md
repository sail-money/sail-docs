# Fee model

The protocol has exactly two fee mechanisms, each bounded by an **immutable constitutional cap**. They differ in scope:

* **Fee 1** is **universal** — a flat charge on every permission registration, so it touches every SMA. It is **live** at a small non-zero rate (see below).
* **Fee 2** is **conditional** — a protocol cut taken only when a manager actually collects a management/performance fee from the SMAs it runs, and is **zero at launch**. An SMA that never has a fee charged against it never incurs Fee 2.

Strategy-level fees (the management/performance schedule the manager charges) are a separate, optional layer that lives in the fee policy; Fee 2 is the protocol's slice of those.

## Fee 1 — Permission registration fee

A flat native-token fee charged each time a permission is registered, paid to the protocol treasury:

```
total fee = permissionRegistrationFee × n_permissions
```

* Bounded by the immutable cap `MAX_PERMISSION_FEE_WEI`, an immutable bytecode ceiling of **0.01** in the chain's native unit, fixed in the `SailGovernance` constructor.
* The active rate (`permissionRegistrationFee`) is governance-tunable within that cap, via the 48-hour timelock.
* **Live at launch.** The current rate is **`0.00015 ETH`** on the 9 ETH-native chains, **`0.00045 BNB`** on BSC, and **`0.005 HYPE`** on HyperEVM. It deployed at `0.00015` native on every chain (CREATE2 requires byte-identical constructor args); governance later raised the live rate on BSC and HyperEVM through the timelock, which does not change the already-locked contract address. Excess `msg.value` is refunded to the submitter.
* Denominated in each chain's native token, with no oracle dependency; governance retunes per chain as native-token prices move. See [Deployment addresses → Fees](../reference/addresses.md#fees-live) for the current per-chain rates.

## Fee 2 — Protocol cut on manager-collected fees

Unlike Fee 1, **Fee 2 is not universal.** It is a cut the protocol takes _off the top_ of a fee that a **manager** is already charging an SMA — so it only exists where a manager actually crystallises a strategy fee. The protocol earns nothing here unless a manager earns first.

### When Fee 2 applies — and when it doesn't

Fee 2 is reached **only** through `collectFees`, and `collectFees` only succeeds for an account that has a fee policy set (`setFeePolicy` → `IFeePolicy`). The intended shape is a **yield or portfolio-management strategy**: a single manager wallet is the delegated signer across **one or more SMAs**, runs the strategy on each, and periodically collects a management and/or performance fee from each account it manages. Fee 2 is the protocol's slice of each of those collections.

Concretely, Fee 2 **does** apply when:

* A manager (EOA, multisig, bot, or AI agent) is delegated over a set of SMAs whose owners have agreed to pay it a management/performance fee, and
* the SMAs have a `trustedFeePolicy` set that names that manager as `feeRecipient`, and
* the manager calls `collectFees` to crystallise its fee on a given account.

Fee 2 **does not** apply to:

* An SMA with **no fee policy** set (`collectFees` reverts with `FeePolicyNotSet`) — e.g. a retail owner self-managing, or any account whose manager simply isn't charging a fee. Such an account can register permissions, dispatch, and operate forever and **never** touch Fee 2.
* Mere registration, dispatch, or any activity other than a manager fee collection. Fee 1 covers registration; Fee 2 is strictly about manager fee crystallisation.

So the two fees scale on different axes: **Fee 1 scales with how many permissions get registered (every SMA), Fee 2 scales with how much fee revenue a manager generates across the SMAs it manages.**

### The shared-policy, multi-SMA case

A fee policy is a standalone contract on governance's `trustedFeePolicy` allowlist, and **one policy instance can be the registered policy for many SMAs at once**. In the typical strategy setup, the manager deploys (or reuses) a single `StandardFeePolicy` whose `feeManager`/`feeRecipient` is the manager wallet, and every SMA that opts into that strategy points its `feePolicy` at that one contract. State that must be per-account — high-water mark, last-collection timestamp, applied rates — is keyed by `account` inside the policy, so each SMA accrues independently even though they share the schedule.

When the manager later collects from each of those SMAs, the kernel takes the same `currentProtocolCutBps` slice from each collection. The protocol cut is computed **per collection, per account** — there is no aggregation across the manager's book.

### The split

When `collectFees` runs, the kernel splits the gross amount the manager requested:

```
protocolCut    = grossFee × currentProtocolCutBps / 10_000
remainder      = grossFee − protocolCut
distributorCut = remainder × distributorBps / 10_000   (0 if distributor == address(0))
managerTake    = remainder − distributorCut
```

* `currentProtocolCutBps` is bounded by the immutable cap `MAX_PROTOCOL_CUT_BPS = 2500` (**25%**) and is **zero at launch** — at launch the manager (and its distributor) keep 100% of the fee they charge.
* `grossFee` is capped by the policy: the kernel enforces `grossFee <= computeFee(...).grossFee`, so the manager can never collect more than its own schedule allows.
* The fee **recipient is pulled from the policy** (`IFeePolicy.feeRecipient()`), not from the caller — a compromised manager cannot redirect fees to itself.
* `distributorBps` is validated `<= 10_000` (`DistributorBpsTooLarge` otherwise). The distributor share is carved out of the manager's _remainder_, not the protocol's cut.
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
