# PowerChain Crisis

**Crisis Capital Network · Verified emergency-capital infrastructure · v1.0.0**

PowerChain Crisis is a full-stack control plane for crisis intelligence, capital routing, Solana settlement visibility, evidence, reconciliation, and auditable release operations. The workspace combines a Fastify API, server-only Next.js gateway, operations console, typed API client, Solana inspection services, provider observability, release controls, and publication-ready documentation.

> **Mainnet means live.** Missing or stale authoritative data is `DEGRADED` or `UNAVAILABLE`; it is never silently replaced with demo data or plausible-looking zeroes.

## Architecture

```text
Solana RPC / Helius       Pyth / Jupiter / CoinGecko / CMC / Birdeye
          \                         /
           +---- Solana data services ----+
                         |
                         v
                  Fastify API :4000
          health · readiness · OpenAPI · WS
                         |
                  server-only gateway
                         |
                         v
                   Next.js Web :3000
                         |
                         v
             Operations / transparency UI
```

## Workspace

| Path | Responsibility |
| --- | --- |
| `apps/backend` | **Only backend**: Fastify runtime plus canonical Solana routes/services/types |
| `apps/web` | Next.js website, same-origin API gateway, Solana operations console |
| `api` | OpenAPI, Swagger, endpoints, fallback policy and Postman |
| `api/postman` | Canonical Postman collection and local environment |
| `programs` | Program deployment registry/manifests |
| `packages/api-contract` | Shared API response types only |
| `packages/api-client` | Typed API client |
| `packages/*` | PWRC, policy, fees, bridge, token factory, rewards and shared domains |
| `docs` | Architecture, API, security, operations, release and protocol documentation |
| `public` / `apps/web/public` | Architecture diagrams and publication assets |

## API

Canonical Solana routes:

```text
GET /api/v1/solana/overview
GET /api/v1/solana/programs
GET /api/v1/solana/market?mint=<address>
GET /api/v1/solana/assets/:mint
```

Operational routes:

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

Compatibility aliases call the same services:

```text
GET /api/solana/overview
GET /api/token/market?mint=<address>
GET /api/assets/:mint
```

The canonical market route always requires `mint`. Only `/api/token/market` may fall back to server-configured `PWRC_MINT`.

## Data authority

- Solana RPC `getTokenSupply` is authoritative for mint supply and decimals.
- Mint inspection distinguishes SPL Token and Token-2022 and reports authorities/extensions when available.
- Required programs are verified from executable accounts; production can pin executable SHA-256 fingerprints.
- Market resolution is source-aware across Pyth, Jupiter, CoinGecko, CoinMarketCap, Birdeye, and Helius.
- Provider freshness, quorum, divergence, block lag, confidence, and SLO state are explicit.
- Market/provider APIs never override on-chain supply truth.

## Security boundary

```text
PWRC       -> utility
USDC / SOL -> crisis capital / settlement
Identity   -> actor
Role       -> operating scope
Policy     -> permitted action
Approval   -> authorization
Signer     -> cryptographic execution
Evidence   -> proof
```

Provider credentials, custom RPC URLs, internal API tokens, and signing material remain server-side. Browser bundles must not contain them. AI output, webhooks, token balances, or client responses never grant treasury authority or prove settlement.

## Quick start

Target toolchain: **Node 24.20.0 LTS**, **pnpm 11.24.0**, and **TypeScript 7.0.2**. See [`docs/BUILD_TOOLCHAIN.md`](docs/BUILD_TOOLCHAIN.md).

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env.local
corepack enable
pnpm install
pnpm dev
```

Development defaults: Web `:3000` · API `:4000` · Solana console `/solana` · Swagger `/api/swagger`.

A production release requires a genuine committed `pnpm-lock.yaml`; never bypass the frozen-lock gate.

## Validation and release

```bash
pnpm check:source
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm release:predeploy
# deploy immutable API + Web images
RELEASE_API_URL=https://api.example pnpm release:postdeploy
```

Release acceptance verifies intended cluster/genesis, provider freshness/quorum, required program IDs/fingerprints, browser-secret isolation, SLO/canary state, runbook and rollback approvals, SBOM/provenance, immutable image digests, and tamper-evident deployment evidence.

## Documentation

Start at [`docs/README.md`](docs/README.md). Canonical OpenAPI: [`api/openapi/powerchain-disaster-relief.yaml`](powerchain-disaster-relief.yaml). Key references: [Architecture](docs/ARCHITECTURE.md) · [API](docs/API_REFERENCE.md) · [Solana](docs/SOLANA_RUNTIME.md) · [Market Data](docs/MARKET_DATA.md) · [Security](docs/SECURITY.md) · [Operations](docs/OPERATIONS_RUNBOOK.md) · [Release](docs/RELEASE_ACCEPTANCE.md) · [Evidence](docs/DEPLOYMENT_EVIDENCE.md).

Shareable handbook: [`PDF`](docs/handbook/PowerChain-Crisis-Full-Documentation-v1.0.0.pdf) · [`DOCX`](docs/handbook/PowerChain-Crisis-Full-Documentation-v1.0.0.docx)

## Release status

Code support does **not** imply that mainnet programs, provider credentials, production images, approvals, or deployment evidence already exist. Production gates remain fail-closed until those deployment-specific facts are verified.


## Public product surfaces

- `/` — product website, dashboard preview, capabilities, trust architecture, provider provenance, partnerships, FAQ and CTA
- `/solana` — Solana operations console
- `/programs` — live configured program verification
- `/network` — source-of-truth and provider architecture
- `/status` — readiness, RPC failover, provider quorum and SLO diagnostics
- `/docs` — documentation index
- `/api/swagger` — Swagger API reference
- `/api/v1/openapi.json` — canonical OpenAPI contract
