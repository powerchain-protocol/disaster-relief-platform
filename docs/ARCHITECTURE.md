# System Architecture

## Overview

```text
Solana RPC / Helius
Pyth / Jupiter / CoinGecko / CoinMarketCap / Birdeye
                  |
                  v
      apps/backend (canonical runtime)
        canonical service package
                  |
                  v
        Fastify API - apps/backend
 health | ready | config | providers | OpenAPI | WS
                  |
        server-only HTTP boundary
                  |
                  v
         Next.js - apps/web
         same-origin /api proxy
                  |
                  v
         React operations UI
                  |
                  v
       typed @powerchain/crisis-api-client
```

## Component responsibilities

### `apps/backend`

The **only backend**. It contains the Fastify runtime and canonical Solana implementation under `src/api` and `src/services`. Compatibility aliases call the same service functions as `/api/v1/*`; there is no root `backend/` package.

Responsibilities:

- HTTP server lifecycle
- Helmet/security headers
- CORS
- global rate limiting
- 1 MiB body limit
- internal-origin token validation
- health/readiness/public config
- provider status
- OpenAPI/Swagger
- WebSocket snapshot stream
- request IDs and redacted logs

### `apps/web`

Next.js runtime responsible for:

- public website origin
- server-only API proxy
- Solana operations console
- polling and stale-state UX
- public whitepaper/assets

Provider keys and RPC URLs do not belong in browser bundles.

### `packages/api-contract`

Shared response types only. It contains no runtime provider, RPC, or route logic.

### `packages/api-client`

Typed GET client used by browser/server code. It intentionally exposes canonical and compatibility methods separately so migrations can be explicit.

### Domain packages

- `policy`: quote/action binding and authority separation
- `fees`: contributor fee quote and successful-funding commission
- `utility`: PWRC utility categories, Power Units and utility tiers
- `bridge`: route/replay/supply-conservation checks
- `token-factory`: issuer-profile production-review checks
- `rewards`: evidence-bound reward epoch validation
- `charts`: data-mode and chart-sanity helpers

## Trust boundaries

```text
Browser
  |
  | no provider secrets
  v
Next.js server proxy
  |
  | POWERCHAIN_INTERNAL_API_TOKEN (optional/production recommended)
  v
Fastify backend
  |
  +--> private RPC / Helius
  +--> Pyth / Jupiter / CoinGecko / CMC / Birdeye
  |
  v
normalized source-aware responses
```

## Data authority hierarchy

| Data | Authority |
| --- | --- |
| Token supply / decimals | Solana RPC `getTokenSupply` |
| Token program / authorities / extensions | Solana mint account inspection |
| Program deployment | Solana executable account + recognized loader |
| Cluster identity | Genesis hash + configured expected hash |
| Price | Configured market-provider resolution |
| Liquidity | Provider enrichment, nullable |
| UI derived FDV | `on-chain UI supply * selected market price` |

## Failure semantics

- **LIVE**: authoritative dependencies are healthy and validation gates pass.
- **DEGRADED**: usable response with freshness/divergence/confidence/cluster concerns.
- **UNAVAILABLE**: a required upstream value cannot be resolved.
- **UNCONFIGURED**: no production configuration exists for that capability.

A degraded state is not equivalent to failure, but financial workflows should decide independently whether degraded market information is acceptable.
