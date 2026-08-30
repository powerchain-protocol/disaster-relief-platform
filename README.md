# PowerChain Relief v1.0.0

**Verified capital infrastructure for emergency response**

PowerChain Relief coordinates crisis funding, deterministic policy, Solana settlement, evidence, reconciliation and auditability while keeping operational truth and on-chain truth distinct.

## Stack

- Node.js 24.20.0 LTS
- pnpm 11.24.0
- TypeScript 7.0.2
- Next.js 16.3.2
- React 19.2.8
- Framer Motion 13.1.1
- Fastify 5.12.1
- `@fastify/swagger` 9.8.1
- `@fastify/swagger-ui` 6.1.1
- `@web3icons/react` 4.1.21
- `@radix-ui/react-icons` 1.3.2

## Monorepo

| Path | Responsibility |
| --- | --- |
| `apps/web` | public website, dashboard, wallet UX, same-origin proxies |
| `apps/backend` | canonical Fastify API, domain logic, Solana/provider services |
| `packages/api-contract` | shared API types |
| `packages/api-client` | typed client |
| `api` | endpoint, OpenAPI, Swagger, WebSocket, fallback and Postman references |
| `programs` | Solana program registry/manifests |
| `docs` | architecture, API, operations and UI/UX references |

## Core invariants

```text
verifiedImpact ≤ delivered ≤ spent ≤ released ≤ escrowed ≤ allocated ≤ available ≤ raised
```

```text
identity → role → policy → approval → signer → execution
```

Wallet connection, PWRC holdings and AI recommendations do not grant treasury authority.

## Developer workflow

```bash
corepack enable
pnpm install
pnpm check:source
pnpm typecheck
pnpm test
pnpm build
```

## Production

Source-level checks are not equivalent to production readiness. Production requires a genuine frozen lockfile, mainnet/genesis binding, real provider credentials, verified program fingerprints, durable mutation persistence and a production signer boundary.

See `docs/ARCHITECTURE.md`, `docs/API_ARCHITECTURE.md`, `docs/UI_UX_SYSTEM.md`, and `docs/OPERATIONS.md`.
