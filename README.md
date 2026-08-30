# PowerChain Relief v1.0.0

**Verified capital infrastructure for emergency response**

PowerChain Relief coordinates crisis funding, deterministic policy, Solana settlement, evidence, reconciliation and auditability while keeping operational truth, authority and on-chain truth distinct.

## Status

- Canonical version: **1.0.0**
- Default theme: **Light**
- Secondary theme: **Dark**
- Node.js: **24.20.0 LTS**
- pnpm: **11.24.0**
- TypeScript: **7.0.2**
- Next.js: **16.3.2**
- React: **19.2.8**
- Fastify: **5.12.1**

Repository readiness and known production blockers are documented in [`BUILD_STATUS.md`](./docs/BUILD_STATUS.md).

## Workspace

| Path | Responsibility |
| --- | --- |
| `apps/web` | public website, responsive dashboard, wallet UX, same-origin API proxies |
| `apps/backend` | canonical Fastify API, domain logic, Solana/provider services |
| `packages/api-contract` | shared API response contracts |
| `packages/api-client` | typed API client |
| `programs` | canonical Solana program deployment registry |
| `api` | OpenAPI, endpoint, Swagger, WebSocket, fallback and Postman references |
| `docs` | architecture, API, security, operations and UI/UX references |
| `tests` | source/regression validation |

App-specific README files are intentionally not used. Repository documentation is consolidated at the root and under `docs/`.

## Core trust boundaries

```text
Operational truth  → Postgres / application ledger
Policy truth       → deterministic rules + approvals
Settlement truth   → Solana RPC
Market intelligence→ provider-derived observations
Verified impact    → independently verified evidence
```

Capital accounting invariant:

```text
verifiedImpact ≤ delivered ≤ spent ≤ released ≤ escrowed ≤ allocated ≤ available ≤ raised
```

Execution authority:

```text
identity → role → policy → approval → signer → execution
```

Wallet connectivity, PWRC holdings and AI recommendations do not grant treasury authority.

## Main product surfaces

```text
/             Public product website
/solana       Solana operations console
/programs     Program assurance registry
/network      Network + provider architecture
/status       Readiness, quorum and SLO state
/docs         Documentation index
/faq          Frequently asked questions
```

## Canonical API

```text
GET /api/v1/health
GET /api/v1/ready
GET /api/v1/providers/status
GET /api/v1/observability/slo

GET /api/v1/solana/overview
GET /api/v1/solana/programs
GET /api/v1/solana/market?mint=<address>
GET /api/v1/solana/assets/:mint

GET /api/v1/wallet/:address/portfolio

POST /api/v1/capital/*
WS   /api/v1/ws/solana
```

`/api/v1/*` is canonical. Compatibility aliases reuse the same service layer.

## Programs

Required strict-readiness programs:

```text
launchpad-registry
launch-policy
token-factory
```

Program IDs and deployment fingerprints are **not committed as guessed defaults**. Production values are deployment configuration and must verify against Solana RPC.

See [`PROGRAMS.md`](./docs/PROGRAMS.md) and [`programs/registry.json`](./programs/registry.json).

## Development

```bash
corepack enable
pnpm install
pnpm check:source
pnpm typecheck
pnpm test
pnpm build
```

## Production

A production release additionally requires:

- genuine frozen lockfile;
- `mainnet-beta` + expected genesis binding;
- multiple distinct configured RPC endpoints;
- production provider credentials;
- required Solana program IDs;
- pinned executable fingerprints;
- raw provider quorum;
- durable mutation persistence;
- production signer boundary;
- deployment/release evidence.

Source-level validation does not imply these deployment conditions have passed.

## Documentation

- [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- [`API_ARCHITECTURE.md`](./docs/API_ARCHITECTURE.md)
- [`UI_UX_SYSTEM.md`](./docs/UI_UX_SYSTEM.md)
- [`OPERATIONS.md`](./docs/OPERATIONS.md)
- [`PROGRAMS.md`](./docs/PROGRAMS.md)
- [`BUILD_STATUS.md`](./docs/BUILD_STATUS.md)
- [`CHANGELOG.md`](./CHANGELOG.md)
- [`CONTRIBUTORS.md`](./docs/CONTRIBUTORS.md)
