# PowerChain Program Deployment Verification

## Purpose

`GET /api/v1/solana/programs` verifies configured PowerChain Launchpad and Crisis program IDs against the active Solana RPC.

The API does not treat an environment variable as proof of deployment.

## Verification criteria

A configured program is considered deployment-verified only when the account:

1. exists;
2. is executable;
3. is owned by a recognized Solana program loader.

Reported loader values include:

- `BPF_LOADER_UPGRADEABLE`
- `LOADER_V4`
- `BPF_LOADER`
- `OTHER`

## States

| State | Meaning |
| --- | --- |
| `DEPLOYED` | Account exists, is executable and loader is accepted |
| `NOT_FOUND` | Configured ID does not exist on active cluster |
| `UNCONFIGURED` | No program ID was supplied |
| `INVALID_CONFIGURATION` | Configured value is not a valid Solana public key |

## Launchpad program bindings

```env
SOLANA_LAUNCHPAD_REGISTRY_PROGRAM_ID=
SOLANA_LAUNCH_POLICY_PROGRAM_ID=
SOLANA_TOKEN_FACTORY_PROGRAM_ID=
SOLANA_TOKEN_2022_VESTING_PROGRAM_ID=
SOLANA_LAUNCHPAD_ESCROW_PROGRAM_ID=
```

The production gate currently requires the first three:

- Launchpad Registry
- Launch Policy
- Token Factory

Additional required programs can be supplied through the JSON registry.

## Registry JSON

Use registry arrays when a deployment needs more entries without changing source code.

Conceptual example:

```json
[
  {
    "slug": "custom-program",
    "label": "Custom Program",
    "family": "LAUNCHPAD",
    "required": true,
    "programId": "<REAL_DEPLOYED_ID>"
  }
]
```

Only use verified deployment IDs. Never populate documentation or production registry files with invented addresses.

## Fingerprint change control

A program ID alone is insufficient to authorize an upgrade. Required Launchpad programs are pinned by executable SHA-256 fingerprint. For non-initial deployments, `scripts/check-program-change-control.mjs` compares each required program's previously verified fingerprint with `EXPECTED_PROGRAM_FINGERPRINTS_JSON`.

If any required fingerprint changes, release acceptance requires an `APPROVED` `release/approvals/program-fingerprint-change.json` record that exactly binds each `slug`, previous fingerprint and new fingerprint. This prevents an operator from silently changing the expected executable hash at the same time as deployment.
