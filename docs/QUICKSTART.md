# Quick Start

## Requirements

- Node.js **>= 24.20.0**
- pnpm **11.24.0**
- A Solana RPC source for realistic development
- Optional Helius and market-provider credentials

The source archive intentionally does not fabricate a `pnpm-lock.yaml`. Generate and commit a real lockfile in the target toolchain before production.

## 1. Configure the backend

```bash
cp apps/backend/.env.example apps/backend/.env
```

Minimum development configuration:

```env
NODE_ENV=development
POWERCHAIN_ENV=development
SOLANA_NETWORK=devnet
ALLOW_DEV_FALLBACK=true
CORS_ORIGINS=http://localhost:3000
```

For realistic development, set one of:

```env
SOLANA_RPC_URL=https://...
# or
HELIUS_RPC_URL=https://...
# or
HELIUS_API_KEY=...
```

## 2. Configure the website

```bash
cp apps/web/.env.example apps/web/.env.local
```

```env
POWERCHAIN_API_URL=http://localhost:4000
POWERCHAIN_INTERNAL_API_TOKEN=
```

`POWERCHAIN_API_URL` is server-only. Do not expose provider credentials through `NEXT_PUBLIC_*` variables.

## 3. Install and run

```bash
corepack enable
pnpm install
pnpm dev
```

Expected local services:

| Surface | URL |
| --- | --- |
| Web | `http://localhost:3000` |
| Solana Console | `http://localhost:3000/solana` |
| API | `http://localhost:4000` |
| Swagger | `http://localhost:4000/api/swagger` |
| OpenAPI JSON | `http://localhost:4000/api/v1/openapi.json` |

## 4. Verify the runtime

```bash
curl http://localhost:4000/api/v1/health
curl http://localhost:4000/api/v1/ready
curl http://localhost:4000/api/v1/solana/overview
```

If `POWERCHAIN_INTERNAL_API_TOKEN` is configured, call protected Solana routes through the Next.js website origin or add:

```bash
-H 'x-powerchain-internal-token: <token>'
```

## 5. Inspect a mint

```bash
curl 'http://localhost:4000/api/v1/solana/assets/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
```

The response identifies classic SPL Token vs Token-2022 and returns RPC-authoritative supply/decimals.

## 6. Resolve market data

```bash
curl 'http://localhost:4000/api/v1/solana/market?mint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
```

The canonical endpoint always requires `mint`.

## 7. Run source checks

```bash
pnpm check:source
```

After dependencies are installed:

```bash
pnpm typecheck
pnpm test
pnpm build
```
