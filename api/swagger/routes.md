# Route Policy

- `/api/v1/*` is canonical.
- compatibility aliases reuse canonical services.
- canonical market inspection requires an explicit mint.
- wallet portfolio uses RPC-native SOL plus optional Helius DAS enrichment.
- health is liveness; readiness is the deployment/release gate.
- the Solana WebSocket is read-only.
- provider credentials, RPC URLs, internal tokens and signing material stay server-side.
