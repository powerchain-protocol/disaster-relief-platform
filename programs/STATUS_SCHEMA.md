# Program Status Schema

Runtime verification may report:

- `UNCONFIGURED` — no program ID configured;
- `INVALID_CONFIGURATION` — configured value is not a valid Solana program address or policy input;
- `NOT_FOUND` — configured address has no matching program account;
- `DEPLOYED` — account exists and is executable under a recognized loader.

Additional verification fields determine whether a deployed program is production-trusted:

- `deploymentVerified`;
- `deploymentFingerprintSha256`;
- `expectedDeploymentFingerprintSha256`;
- `programDataAddress`;
- `lastDeploySlot`;
- `upgradeAuthority`.

`DEPLOYED` and `deploymentVerified` are intentionally separate concepts.
