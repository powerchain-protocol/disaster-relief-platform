# API Reference

Base API version: **v1.0.0**

All `/api/*` responses are sent with `Cache-Control: no-store`. Fastify also returns `x-request-id` and `x-powerchain-version` headers.

## System routes

### `GET /api/v1/health`

Liveness only. Does not prove RPC readiness.

Example:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptimeSeconds": 144,
  "timestamp": "2026-08-29T00:00:00.000Z"
}
```

### `GET /api/v1/ready`

Checks current RPC chain state and optional genesis-hash binding.

- `200`: ready (may be `READY` or `DEGRADED`)
- `503`: not ready

### `GET /api/v1/config/public`

Returns non-secret network/provider capability booleans. It may expose configured `PWRC_MINT`, because a mint address is public, but never API keys or RPC URLs.

### `GET /api/v1/providers/status`

Returns redacted provider telemetry:

- configured
- state
- last checked
- latency
- consecutive failures
- redacted error code
- cache entry/in-flight counts

### OpenAPI / docs

```text
GET /api/v1/openapi.json
GET /api/openapi.json
GET /api/docs       -> redirects to /api/swagger
GET /api/swagger
```

## Canonical Solana routes

### `GET /api/v1/solana/overview`

Returns:

- network
- service status
- RPC source and latency
- genesis/expected-genesis match
- health
- slot
- block height
- epoch and slot index
- Solana core version / feature set
- latest blockhash / last-valid block height
- total/circulating SOL supply
- capability summary

### `GET /api/v1/solana/programs`

Verifies configured PowerChain programs by reading account state from the active RPC.

Each program includes:

- slug / label / family
- required flag
- program ID
- state
- deploymentVerified
- executable
- owner
- loader
- lamports
- account data length

### `GET /api/v1/solana/market?mint=<address>`

`mint` is mandatory.

Response groups:

- `onChain`: supply/decimals from RPC
- `market`: price, 24h change, liquidity, volume, market cap, Jupiter block metadata
- `observations`: every valid provider observation
- `resolution`: selected provider, priority, divergence, Pyth confidence
- `derived`: FDV
- `use`: always `DISPLAY_AND_ANALYTICS_ONLY`

### `GET /api/v1/solana/assets/:mint`

Returns:

- token program and program kind
- supply/decimals
- initialized state
- mint/freeze authority
- Token-2022 extensions when parser data exists
- optional Helius metadata enrichment

## Compatibility aliases

```text
GET /api/solana/overview
GET /api/token/market?mint=<address>
GET /api/assets/:mint
```

These routes call the canonical service layer and add:

```text
Deprecation: true
Link: <...canonical route...>; rel="successor-version"
```

Only `/api/token/market` may omit `mint`; it then uses backend-configured `PWRC_MINT`. If neither exists, the route returns `PWRC_MINT_NOT_CONFIGURED`.

## Website-origin proxy

The Next.js website exposes matching `/api/...` paths. Browser code should prefer the website origin so backend/provider credentials remain server-side.

## Error contract

Typical error:

```json
{
  "code": "MARKET_DATA_UNAVAILABLE",
  "message": "No configured market provider returned a valid price for this mint.",
  "details": { "mint": "..." }
}
```

Common codes include:

| Code | Meaning |
| --- | --- |
| `INVALID_SOLANA_ADDRESS` | Mint/program input is not a valid 32-byte base58 key |
| `SOLANA_RPC_UNAVAILABLE` | RPC call failed or no production RPC configured |
| `CLUSTER_MISMATCH` | Genesis does not match intended cluster where enforced |
| `MARKET_DATA_UNAVAILABLE` | No acceptable provider price |
| `SOLANA_ASSET_NOT_FOUND` | Mint account does not exist |
| `UNSUPPORTED_TOKEN_PROGRAM` | Account is not owned by SPL Token or Token-2022 |
| `PWRC_MINT_NOT_CONFIGURED` | Legacy market default requested without configured mint |
| `BACKEND_ORIGIN_AUTH_REQUIRED` | Protected route accessed without valid internal token |

## cURL examples

```bash
curl http://localhost:4000/api/v1/solana/overview
curl http://localhost:4000/api/v1/solana/programs
curl 'http://localhost:4000/api/v1/solana/market?mint=<MINT>'
curl 'http://localhost:4000/api/v1/solana/assets/<MINT>'
```

## GET /api/v1/observability/slo

Returns the rolling API service-level window used by production readiness and canary verification. The response includes sample count, minimum samples, availability, availability target, p95 latency, latency target, `evaluable`, and combined `ok` state. Probe endpoints are excluded from the sample set.
