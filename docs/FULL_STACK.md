> See the complete documentation index in [`docs/README.md`](README.md).

# PowerChain Crisis v1.0.0 — Full-stack wiring

This workspace is organized so the Solana/provider implementation has one authority path from RPC/provider to browser:

```text
Solana / Helius / Pyth / Jupiter / CoinGecko / CoinMarketCap / Birdeye
                               |
                               v
                    apps/backend (canonical runtime)
                               |
                   Fastify apps/backend :4000 (single backend)
               health · ready · OpenAPI · WS
                               |
                       server-only HTTP
                               |
                    Next.js apps/web :3000
                               |
                   same-origin /api/* proxy
                               |
                       React operations UI
```

## Runtime boundaries

### Backend

`apps/backend` is the only runtime that receives provider/RPC credentials. It registers security headers, same-origin-first CORS, rate limiting, 1 MiB request ceiling, Swagger/OpenAPI, optional backend-origin token validation, liveness/readiness and a bounded Solana WebSocket stream.

The canonical Solana implementation lives only in `apps/backend/src/`. Canonical and compatibility routes call the same service functions; shared response types live in `@powerchain/crisis-api-contract`.

### Website

`apps/web` calls only website-origin paths. Its route handlers proxy to `POWERCHAIN_API_URL` using `server-only`. No Helius/RPC/Pyth/Jupiter/CoinGecko/CoinMarketCap/Birdeye credential is referenced by a client component or `NEXT_PUBLIC_*` variable.

The `/solana` screen polls overview every 30 seconds and deployment verification every 60 seconds, then performs explicit mint inspection on user action. Missing/failed data is displayed as unavailable/error rather than converted to zero.

### Typed client

`@powerchain/crisis-api-client` is the browser/server contract for health, readiness, public config, v1 Solana routes and compatibility aliases.

## API surfaces

```text
GET /api/v1/health
GET /api/v1/ready
GET /api/v1/config/public
GET /api/v1/openapi.json
GET /api/v1/solana/overview
GET /api/v1/solana/programs
GET /api/v1/solana/market?mint=<address>
GET /api/v1/solana/assets/:mint
WS  /api/v1/ws/solana

GET /api/solana/overview
GET /api/token/market?mint=<address>
GET /api/assets/:mint
```

The v1 market route is strict. Only `/api/token/market` may default to backend-configured `PWRC_MINT`.

## Local run

Use Node 24.20+ and pnpm 11.24.0.

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env.local
corepack enable
pnpm install
pnpm dev
```

In development, `ALLOW_DEV_FALLBACK=true` may use public Solana RPC. Production must configure private RPC/Helius and keep development fallback disabled.

## Release gates

Before production, generate and commit a real `pnpm-lock.yaml` under the pinned Node/pnpm toolchain, then switch CI/container installs to `--frozen-lockfile`. The source package intentionally does not manufacture a lockfile when the registry is unavailable.


```bash
pnpm typecheck
pnpm test
pnpm build
NODE_ENV=production POWERCHAIN_ENV=production pnpm check:source
```

A source-complete workspace is not evidence that mainnet program IDs, provider credentials or production infrastructure are deployed. Those remain target-environment facts.


## Provider observability

See `docs/PROVIDER_OBSERVABILITY.md`. Runtime provider telemetry is exposed at `/api/v1/providers/status` without returning provider URLs or credentials.
