# PowerChain Relief API

**Canonical version:** 1.0.0  
**Namespace:** `/api/v1`  
**Transport:** HTTPS + read-only WebSocket snapshots  
**Runtime:** Fastify 5

The API is organized around four trust boundaries:

1. **System** — liveness, readiness, public configuration, provider health and SLOs.
2. **Solana** — authoritative cluster, program, mint and transaction state.
3. **Wallet** — read-only portfolio intelligence and message-signing boundaries.
4. **Capital** — deterministic capital transitions, policy review, evidence, approvals, settlement and reconciliation.

## Contract principles

- `/api/v1/*` is canonical.
- compatibility aliases reuse canonical services.
- all state-changing capital operations are idempotent.
- missing or uncertain execution is never converted to synthetic success.
- Solana RPC remains authoritative for chain state.
- market providers enrich analytics only.
- credentials, RPC URLs and signing material stay server-side.

## Developer surfaces

- OpenAPI: `/api/v1/openapi.json`
- Swagger UI: `/api/swagger`
- WebSocket: `/api/v1/ws/solana`
- Postman: `api/postman/`
- Endpoint reference: `api/endpoints/`
- Fallback policy: `api/fallbacks/`

## Response conventions

Successful APIs should expose an explicit resource payload and source/state metadata. Errors use stable machine-readable codes and always include a request identifier at the HTTP boundary.

Production consumers should treat HTTP status, explicit state, freshness, source identity and reconciliation status as independent signals.
