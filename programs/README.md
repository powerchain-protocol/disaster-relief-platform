# PowerChain Solana Programs

Canonical deployment registry surface for PowerChain Crisis v1.0.0.

This directory deliberately does not embed guessed program IDs or fingerprints. Production values come from environment configuration and must verify through Solana RPC before strict readiness passes.

Required production programs:

- `launchpad-registry`
- `launch-policy`
- `token-factory`

Runtime verification:

```text
GET /api/v1/solana/programs
GET /api/v1/ready
```
