# PowerChain Solana Programs

**Canonical version:** 1.0.0  
**Registry:** `programs/registry.json`

PowerChain uses deployment-driven Solana program identity. Source code does not embed guessed production addresses or executable fingerprints.

## Required programs

| Program | Family | Strict readiness |
| --- | --- | ---: |
| `launchpad-registry` | registry | required |
| `launch-policy` | policy | required |
| `token-factory` | tokenization | required |

## Optional programs

| Program | Family |
| --- | --- |
| `token-2022-vesting` | tokenization |
| `launchpad-escrow` | escrow |
| `crisis-fundings` | relief-capital |
| `stablecoin` | payments |
| `oracles` | market-data |
| `supply-chain` | logistics |

Optional means “not globally required for strict platform readiness.” A product capability may still require one of these programs.

## Verification model

For each configured program, runtime verification should establish:

```text
program ID configured
      ↓
base58 / 32-byte validation
      ↓
account exists
      ↓
account executable
      ↓
recognized loader
      ↓
UpgradeableLoader ProgramData (when applicable)
      ↓
deploy slot + upgrade authority
      ↓
executable data SHA-256
      ↓
pinned fingerprint match (production)
```

States:

```text
UNCONFIGURED
INVALID_CONFIGURATION
NOT_FOUND
DEPLOYED
```

A configured account is not considered verified merely because the address parses.

## Change control

Initial deployment:
`INITIAL_DEPLOYMENT`

Upgrade:
`current fingerprint → approved target fingerprint`

Production upgrade approval should bind:

- program slug;
- environment/network;
- current fingerprint;
- target fingerprint;
- approval identity;
- approval timestamp;
- deployment evidence reference.

## Environment configuration

Every registry entry declares its program-ID environment variable and fingerprint environment variable.

No program private key belongs in application configuration.

## Runtime endpoints

```text
GET /api/v1/solana/programs
GET /api/v1/ready
```

The public `/programs` UI is a presentation layer over the same verification service.
