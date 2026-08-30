# Contributors

PowerChain Relief is maintained as part of the PowerChain Protocol project.

## Contribution requirements

Contributions must preserve the canonical v1.0.0 trust and authority boundaries:

- PWRC utility does not grant treasury authority;
- wallet connectivity is separate from operator authentication;
- mainnet data must be live, stale/degraded, or explicitly unavailable—never fabricated;
- client signatures are not authoritative settlement proof;
- provider secrets remain server-side;
- Solana RPC remains authoritative for chain state;
- market providers do not override supply, balances or program identity;
- raised, allocated, escrowed, released, delivered and verified-impact states remain distinct;
- `EXECUTION_UNKNOWN` must be reconciled before any retry;
- program IDs and fingerprints must come from deployment configuration/evidence.

## Pull-request expectations

Changes affecting capital, settlement, signing, programs, providers or release gates should include:

1. invariant or policy rationale;
2. source-level regression coverage;
3. configuration changes;
4. API contract changes when applicable;
5. documentation updates;
6. explicit production assumptions and blockers.

Do not commit private keys, RPC credentials, provider keys or signing material.
