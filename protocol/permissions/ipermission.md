# IPermission & Context

Every Sail permission implements a single interface. It is small on purpose.

```solidity
interface IPermission {
    /// Decide whether a manager-submitted transaction is permitted.
    function evaluate(bytes calldata txData, Context calldata ctx)
        external view returns (bool);

    /// Optional stable identifier for off-chain indexing/deduplication.
    function discriminator() external view returns (bytes32);
}
```

* `evaluate` is `view` and is called by the kernel via `staticcall` under `PERMISSION_GAS_CAP` (150,000 gas). A revert or gas exhaustion is treated as `false`. It may read arbitrary on-chain state within the gas budget but can never mutate state.
* `discriminator` returns a stable identifier — by convention `keccak256("<ContractName>")` for fixed-shape permissions, or `bytes32(0)` for generic/multi-purpose ones. It is metadata for off-chain tooling; the kernel does not use it for authorization.

## The Context struct

The kernel passes a read-only snapshot of the dispatch environment, captured at the moment of evaluation. Reproduced verbatim from `contracts/interfaces/IPermission.sol`:

```solidity
struct Context {
    address account;        // the Safe account whose assets are being moved
    address manager;        // the delegated signer who submitted the dispatch
    address submitter;      // msg.sender of the dispatch; may differ from manager (relayer)
    address target;         // the call target address
    bytes4  selector;       // leading 4 bytes of calldata; bytes4(0) if calldata < 4 bytes
    uint256 value;          // native ETH forwarded with the call (wei)
    uint256 blockTimestamp; // block.timestamp at dispatch — for time-based gates
    uint256 blockNumber;    // block.number at dispatch
}
```

Field-by-field:

| Field | Use it to… |
| --- | --- |
| `account` | scope per-account config (`mapping(account => …)`); confirm a swap's `recipient == account`. |
| `manager` | enforce identity-based rules (e.g. require a specific agent wallet). |
| `submitter` | gate on the relayer/submitter if your threat model needs it. |
| `target` | allowlist the contract being called. |
| `selector` | route by function; reject unknown selectors. |
| `value` | reject unexpected ETH on ERC-20 calls. |
| `blockTimestamp` / `blockNumber` | time- or block-based windows and rate limits. |

The raw calldata of the call being dispatched arrives as `txData` (so `txData[:4] == ctx.selector` when length ≥ 4).

## Implementation checklist

From the integration guidance and the shipped templates:

1. **Check calldata length before decoding.** `abi.decode` on short calldata reverts (treated as `false`); guard with explicit length checks first.
2. **Return `false` for unknown selectors** — don't revert; just deny.
3. **Validate the target** against an allowlist unless the permission is intentionally selector-only.
4. **Check `ctx.value`** — token calls should carry no ETH; a non-zero `value` is suspicious.
5. **Return `false` for malformed or out-of-bounds input** — never assume well-formed calldata.
6. **Stay well under 150k gas** — leave margin for decoding, memory, and any on-chain reads. As a rough guide: staticcall overhead ~3k, a 2-arg decode ~1–2k, a cold `SLOAD` 2,100, an oracle call 5–20k+.
7. **Implement `discriminator()`** — `keccak256("YourPermissionName")`, or `bytes32(0)` if generic.

A minimal permission:

```solidity
contract AllowTargetPermission is IPermission {
    address public immutable allowedTarget;
    constructor(address t) { allowedTarget = t; }

    function evaluate(bytes calldata, Context calldata ctx) external view returns (bool) {
        return ctx.target == allowedTarget;
    }
    function discriminator() external pure returns (bytes32) {
        return keccak256("AllowTargetPermission");
    }
}
```

Walk through a real one in [Write your first permission](../guides/write-a-permission.md).
