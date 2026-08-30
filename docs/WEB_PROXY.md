# Next.js Website-Origin Proxy

## Goal

The browser should call the website origin, not private provider/RPC origins.

```text
Browser
  -> /api/v1/solana/overview on website
  -> Next.js server route
  -> POWERCHAIN_API_URL
  -> Fastify backend
  -> RPC/providers
```

## Configuration

`apps/web/.env.local`:

```env
POWERCHAIN_API_URL=http://localhost:4000
POWERCHAIN_INTERNAL_API_TOKEN=
```

Provider keys do not belong here.

## Proxy behavior

The server helper:

- accepts only backend paths starting with `/api/`;
- copies incoming query parameters;
- forwards `x-request-id` when provided;
- forwards `Authorization` when needed;
- adds `x-powerchain-internal-token` server-side;
- enforces 10-second upstream timeout;
- disables cache;
- preserves selected response headers;
- blocks a proxy loop when backend origin equals website origin.

## Preserved headers

```text
content-type
deprecation
link
x-request-id
x-powerchain-version
retry-after
```

Hop-by-hop headers are intentionally not forwarded.

## Security rule

Do not add any of the following to browser-visible environment variables:

- Helius API key
- custom RPC URL with embedded key
- Pyth key
- Jupiter key
- CoinGecko key
- CoinMarketCap key
- Birdeye key
- internal backend token

The production gate scans sensitive `NEXT_PUBLIC_*` names and rejects configured values.
