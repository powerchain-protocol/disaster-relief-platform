# PowerChain Crisis API

Fastify v5 server runtime for PowerChain Crisis v1.0.0.

## Responsibilities

- expose liveness, strict readiness, public capability, provider telemetry, and SLO endpoints;
- register the canonical Solana API package once;
- serve OpenAPI/Swagger and bounded Solana WebSocket snapshots;
- enforce request IDs, rate limits, body ceilings, security headers, and no-store semantics;
- keep RPC/provider credentials and internal authentication server-side.

## Core endpoints

```text
GET /api/v1/health
GET /api/v1/ready
GET /api/v1/config/public
GET /api/v1/providers/status
GET /api/v1/observability/slo
GET /api/v1/openapi.json
GET /api/swagger
WS  /api/v1/ws/solana
```

This app is the single canonical backend. Solana routes and services live under `src/api` and `src/services`; shared response types live in `packages/api-contract`; there is no duplicate root `backend/` package.

## Security and readiness

`POWERCHAIN_INTERNAL_API_TOKEN` may protect backend-origin Solana requests. Provider keys, RPC URLs, and signing material must never be exposed through `NEXT_PUBLIC_*` variables or response payloads.

Strict readiness is stronger than liveness: production can enforce cluster/genesis binding, provider freshness/quorum, SLO state, and required program deployment/fingerprint verification.

See `../../docs/API_REFERENCE.md`, `../../docs/SECURITY.md`, and `../../docs/PRODUCTION_DEPLOYMENT.md`.

## Development server

`pnpm run dev` defaults to port `4000`. In local development an occupied port automatically retries the next port (up to ten attempts) and logs the selected address. Set `DEV_PORT_FALLBACK=false` for exact-port behavior.

Production never changes ports automatically: `EADDRINUSE` remains a startup failure. Fastify request logging now uses the v5.12 `LogController` API instead of the deprecated top-level `disableRequestLogging` option.


## Runtime configuration validation

Startup validates port, provider/RPC URLs, provider timeout ranges, production network selection, and development-only port fallback before the server starts listening. Invalid configuration fails early with `INVALID_RUNTIME_CONFIG`.

Provider HTTP adapters use bounded timeouts and normalized error codes. Provider fallback never changes authoritative Solana supply, balances, program IDs, settlement state, or cluster identity.
