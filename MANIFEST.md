# PowerChain Crisis v1.0.0 — Full-stack Manifest

## Wired runtime

- `apps/backend` — Fastify 5 API runtime with liveness/readiness, public config, OpenAPI/Swagger, bounded WebSocket snapshots, Helmet, CORS, rate limiting, 1 MiB request limit and optional backend-origin token enforcement.
- `apps/backend` — single canonical Fastify runtime containing Solana services and canonical/compatibility routes.
- `packages/api-contract` — shared response types only; no backend runtime logic.
- `apps/web` — Next.js 16.3 / React 19 public site, same-origin server proxy and responsive `/solana` operations console.
- `packages/api-client` — typed v1 health/config/Solana client used by browser/server applications.
- `packages/policy`, `fees`, `utility`, `bridge`, `token-factory`, `rewards`, `charts` — bounded v1.0.0 domain modules retained from the architecture hardening layer.

## Solana authority path

```text
RPC / Helius / market providers
             ↓
apps/backend/src/services/solana-data.ts
             ↓
canonical Fastify routes
             ↓
compatibility aliases (same functions)
             ↓
server-only Next.js proxy
             ↓
typed API client
             ↓
React operations UI
```

Canonical routes:

- `/api/v1/solana/overview`
- `/api/v1/solana/programs`
- `/api/v1/solana/market?mint=<address>`
- `/api/v1/solana/assets/:mint`

Compatibility aliases:

- `/api/solana/overview`
- `/api/token/market`
- `/api/assets/:mint`

Only `/api/token/market` may default to configured `PWRC_MINT`; v1 always requires an explicit mint.

## System/runtime surfaces

- `/api/v1/health`
- `/api/v1/ready`
- `/api/v1/config/public`
- `/api/v1/providers/status`
- `/api/v1/openapi.json`
- `/api/openapi.json`
- `/api/docs`
- `/api/swagger`
- `/api/v1/ws/solana`

Website-origin proxies are included for health/readiness/config/OpenAPI plus all requested Solana GET routes.

## Security boundaries

- provider/RPC credentials exist only in the backend environment;
- no provider secret is exposed through `NEXT_PUBLIC_*`;
- optional `POWERCHAIN_INTERNAL_API_TOKEN` is compared in constant time for protected backend data routes;
- API responses are `no-store`;
- Swagger authorization persistence is disabled;
- WebSocket payload size, topic set and per-connection message count are bounded;
- production fallback to public Solana RPC is prohibited by the production gate;
- missing provider/market/mint state is unavailable/degraded, never a fabricated zero;
- provider telemetry is redacted and Helius DAS is isolated from generic/custom RPC routing;
- concurrent cache misses coalesce to one upstream request;
- production requires a pinned genesis hash, strong backend-origin token, non-wildcard CORS and required Launchpad program IDs.

## User-facing integration

`/solana` provides:

- RPC/cluster health, slot, block height, Solana version and latest blockhash;
- PowerChain Launchpad/Crisis program deployment verification;
- explicit mint input with no hidden default;
- SPL vs Token-2022 inspection, supply, decimals, mint/freeze authorities and extensions;
- source-aware USD price, 24h change, liquidity, divergence, block lag and provider status;
- manual refresh and stale-snapshot warnings without replacing last-good data with zeros.

All visible controls are wired to an action or destination; static internal-link validation reports no dead links.

## Documentation/assets

- latest 19-page A4 whitepaper PDF at `public/docs/whitepaper.pdf` and `apps/web/public/docs/whitepaper.pdf`;
- editable DOCX at `public/docs/whitepaper.docx` and `docs/whitepaper/...docx`;
- nine architecture SVG sources plus mirrored web assets;
- Postman collection, Solana API reference, full-stack wiring guide, security/economics/UX/SLO docs.

## Validation completed in artifact runtime

- economic/route invariants: PASS
- security/economic binding: PASS
- chart/architecture grammar: PASS
- Solana API source invariants: PASS
- mocked Solana/Jupiter/Token-2022 runtime smoke: PASS
- provider telemetry runtime assertions: PASS
- full-stack wiring/security/client/UI test: PASS
- required structure: 126 artifacts PASS
- TypeScript/TSX syntax: 46 files PASS
- JSON: 33 files PASS
- SVG/XML: 18 files PASS
- DOCX package integrity: PASS
- web no-gradient rule: PASS
- Nepal/demo geography consistency: PASS
- browser provider-secret scan: PASS
- internal links/routes: 2 pages + 11 API handlers PASS
- public whitepaper: 19 A4 pages

## Unexecuted dependency-backed gates

This runtime is Node 22.16.0 and could not download pnpm 11.24.0 because registry DNS returned `EAI_AGAIN`. A `pnpm-lock.yaml` was therefore not fabricated. Full `pnpm install`, framework typecheck/build, Fastify boot test and Next production build remain target-toolchain release gates under Node >=24.20.0.

## Executable release acceptance

The repository now treats production promotion as two fail-closed phases.

### Pre-deploy

```text
reviewed manifests
      ↓
pnpm-lock.yaml
      ↓
pnpm install --frozen-lockfile
      ↓
typecheck → test → build
      ↓
production configuration gate
      ↓
compiled browser secret scan
      ↓
runbook + rollback approval
```

### Post-deploy

```text
immutable API/web images
      ↓
strict /api/v1/ready
      ↓
intended cluster/genesis match
      ↓
required program verification
      ↓
required provider telemetry LIVE
      ↓
deployment evidence record
```

Executable entry points:

- `pnpm release:predeploy`
- `pnpm release:postdeploy`
- `pnpm release:gate`
- `.github/workflows/release-gate.yml`
- `.github/workflows/bootstrap-lockfile.yml` for generating a missing lockfile in an online review environment; its artifact must be reviewed and committed before the production workflow is considered reproducible.

`release/evidence/deployment-<deploymentId>.json` binds a promoted release to the release version, source commit, lockfile hash, API/web image digests, redacted configuration hash, intended and observed Solana cluster/genesis, verified required program IDs, provider telemetry, approval hashes and gate results. Secrets are explicitly excluded.

The bundled `release/evidence/hermetic-integration-validation.json` is not deployment proof. It records which release controls passed in deterministic local validation and which remain blocked on external production evidence.

## Release-integrity additions

- `scripts/lib/release-integrity.mjs`
- `scripts/generate-sbom.mjs`
- `scripts/generate-release-provenance.mjs`
- `scripts/verify-release-artifacts.mjs`
- `scripts/check-rollback-target.mjs`
- program deployment fingerprints and provider freshness/quorum in the canonical Solana service

## Release hardening II additions

- `config/release-policy.json`
- `apps/backend/src/runtime-metrics.ts`
- `apps/web/app/api/v1/observability/slo/route.ts`
- `scripts/check-release-policy.mjs`
- `scripts/check-program-change-control.mjs`
- `scripts/canary-verify.mjs`
- `scripts/sign-deployment-evidence.mjs`
- `release/approvals/program-fingerprint-change.json`
- `tests/slo-runtime.mjs`
- `docs/RELEASE_HARDENING_V2.md`
