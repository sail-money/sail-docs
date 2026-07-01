# Open-Source Licenses

**Last updated: July 1, 2026**

Both Sail products are open-source software. **Your rights to use, copy, modify, and distribute the software come from these licenses — not from the [Terms of Use](terms-of-use.md).** Nothing in the Terms of Use limits, conditions, or revokes any right these licenses grant. If the Terms of Use and an open-source license ever conflict as to the software, the license controls.

The authoritative license text is the `LICENSE` file (and the per-file `SPDX-License-Identifier` headers) in each source repository. The summary below is for convenience only.

## Sail Protocol

Sail Protocol is **mixed-license**, and it is not accurate to call it simply "GPL":

* **Kernel and core contracts — `GPL-2.0-or-later`.** This covers the `SailKernel`, the mandate factory, governance, fee policy, permission templates, and related core contracts. Copyleft: distributing modified versions of these contracts carries the GPL's source-availability obligations.
* **Interface contracts — `MIT`.** The contract interfaces (the `contracts/interfaces` files — e.g. `IPermission`, `IFeePolicy`, `IOracle`, `SailCapabilities`) and the Safe module-enabler helper are MIT-licensed, so you can build against and integrate with the protocol permissively.

Each Solidity file declares its own license in its `SPDX-License-Identifier` header; that header is authoritative for that file.

* Repository: [github.com/sail-money/Protocol](https://github.com/sail-money/Protocol)
* License file: [LICENSE (GPL-2.0)](https://github.com/sail-money/Protocol/blob/main/LICENSE)

## Sailor

Sailor — the TypeScript toolkit, CLI, and SDK — is licensed under the **`MIT`** license in full.

* Repository: [github.com/sail-money/Sailor](https://github.com/sail-money/Sailor)
* License file: [LICENSE (MIT)](https://github.com/sail-money/Sailor/blob/main/LICENSE)
* Package: [`@sail.money/sailor`](https://www.npmjs.com/package/@sail.money/sailor) on npm

## Third-party components

Both products depend on third-party open-source components, each under its own license (for example, [Safe](https://safe.global) contracts and libraries, and the `viem` library used by Sailor). Those components are governed by their respective licenses, which are included with their source.

## Trademarks are not licensed

These open-source licenses grant rights to the **code only.** "Sail," "Sailor," and related names and logos are trademarks of Agentic Finance Inc. and are **not** licensed under GPL, MIT, or any other license here.

## Contact

Questions about licensing: **hello@sail.money**.
