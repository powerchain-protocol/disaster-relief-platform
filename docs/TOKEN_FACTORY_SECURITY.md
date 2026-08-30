> See the complete documentation index in [`docs/README.md`](README.md).

# Token Factory Security v1.0.0

## Profiles

### PROJECT

- capped mint default;
- verified issuer;
- metadata and purpose disclosure;
- configurable transfer restrictions;
- freeze/mint authority custody policy.

### COMPANY

- verified organization;
- organization approval matrix;
- explicit treasury/mint authority separation;
- configurable issuance cap and transfer policy.

### GOVERNMENT

- restricted-transfer default posture;
- verified public-sector issuer identity;
- program/purpose disclosure;
- stronger signer and change-control requirements;
- no public minting before deployment-specific legal/security review.

## Reserve-backed mode

Do not label an asset `stablecoin` merely because the mint is capped. Reserve-backed issuance needs:

- reserve asset definition;
- reserve ratio;
- reserve custodian/trust model;
- attestation source;
- redemption policy;
- mint/burn authorization policy;
- reconciliation;
- incident/pause procedure.

## Mint secret boundary

The backend prepares transactions and verifies results. It should not receive or persist the mint private key.
