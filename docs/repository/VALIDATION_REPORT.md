# Validation Report — PowerChain Crisis v1.0.0 Full-stack Improvements

Date: 2026-08-29

## Passed source/runtime checks

```text
Economic and route invariants                          PASS
Security and economic binding                         PASS
Chart and architecture visual grammar                  PASS
Solana API / mint / provider / proxy invariants       PASS
Mock RPC + Jupiter + Token-2022 runtime smoke          PASS
Provider telemetry runtime assertions                  PASS
Full-stack backend/client/web/security wiring          PASS
Required repository artifacts                          126 PASS
TypeScript / TSX syntax                                46 files PASS
JSON                                                    33 files PASS
SVG / XML                                               18 files PASS
No gradients in wired website UI                       PASS
Nepal/demo geography consistency                       PASS
Browser provider-secret public-env scan                PASS
Internal website links                                 2 page routes PASS
```

The runtime smoke executes the actual Solana service after TypeScript transpilation against deterministic mocked RPC/Jupiter responses. It validates cluster overview, Jupiter price/liquidity resolution, Token-2022 inspection and redacted provider telemetry.

## Improvements validated in this pass

- in-flight request coalescing prevents duplicate upstream calls for the same cache key;
- Helius DAS uses the Helius endpoint/API key independently from a generic custom `SOLANA_RPC_URL`;
- `/api/v1/providers/status` exposes configuration, state, latency, failures and cache pressure without returning provider URLs or credentials;
- Launchpad program verification uses batched `getMultipleAccounts` and requires a recognized Solana loader plus executable state;
- Pyth confidence is an explicit market-quality gate in addition to freshness, provider divergence and Jupiter block lag;
- website polling prevents overlap, slows while hidden, refreshes on visibility restore and labels stale last-good snapshots;
- Next.js applies CSP/COOP/CORP/HSTS and related security headers;
- production gate requires a pinned genesis hash, >=32-character backend-origin token, non-wildcard CORS, production provider credentials and core Launchpad program IDs;
- `/api/docs` and `/api/openapi.json` compatibility surfaces are available alongside `/api/swagger` and `/api/v1/openapi.json`.

## Production gate result in this artifact runtime

Expected: **FAIL-CLOSED**.

The production check correctly rejected this sandbox because:

- Node is 22.16.0, below the repository requirement of 24.20.0;
- no genuine `pnpm-lock.yaml` is present;
- production environment flags/mainnet selection are not set;
- no private Solana/Helius RPC is configured;
- no pinned genesis hash is configured;
- no strong backend-origin token is configured;
- production CORS origins are absent;
- required Launchpad program deployment IDs are absent;
- no production market-provider credential is configured.

A synthetic lockfile or fake deployment/provider value was not created.

## Required target-environment gates

```text
Node >=24.20.0
pnpm 11.24.0
pnpm install + commit genuine pnpm-lock.yaml
pnpm typecheck
pnpm test
pnpm build
NODE_ENV=production POWERCHAIN_ENV=production pnpm check:production
```

Production mainnet additionally requires verified private RPC/Helius infrastructure, the expected genesis hash, provider credentials, explicit CORS origins, backend-origin authentication and real PowerChain Launchpad program deployment IDs.

## Full documentation validation

- Documentation regression test: PASS (31 required artifacts)
- Markdown documentation files: 45+ topic/reference files
- Relative Markdown link scan: PASS
- Full Documentation handbook: 18 pages
- DOCX visual QA: PASS, every page inspected
- DOCX accessibility: 0 high-severity findings; remaining medium notices are non-data single-cell/code/callout tables
- PDF preflight: openable, unencrypted, text-based, 18 pages
- Public web copies: `/docs/full-documentation.pdf` and `/docs/full-documentation.docx`

## Architecture badge / connector fit validation

- 9 architecture SVGs parse successfully.
- Every card-owned status badge is geometrically contained within its parent card.
- Shared branch rails contain no arrowheads; arrowheads terminate only on destination segments.
- Connector paths route through whitespace and terminate at card boundaries.
- React `ArchitectureMap` clips text/badges to node interiors and dynamically sizes status badges.
- The 18-page handbook was re-rendered after the fix; architecture-heavy pages were independently checked in PDF output.

## Executable release-acceptance status

The full promotion workflow is now wired, but this artifact does **not** convert missing production evidence into green checks.

| Acceptance criterion | Artifact-runtime result | Promotion requirement |
| --- | --- | --- |
| Frozen dependency install | BLOCKED | Commit a genuine `pnpm-lock.yaml`; run Node 24.20.0 + pnpm 11.24.0 `pnpm install --frozen-lockfile`. |
| Typecheck / test / build | BLOCKED dependency-backed; source/runtime suite PASS | Must pass after the frozen install using actual Next/Fastify/React declarations. |
| Production gate | BLOCKED | Requires target runtime plus real production configuration. |
| Readiness returns intended cluster | PASS hermetic; LIVE BLOCKED | Deployed `/api/v1/ready` must report ready, strict, intended network and matching genesis. |
| Required programs verify | PASS hermetic fixtures; LIVE BLOCKED | Real PowerChain Launchpad IDs must exist, be executable and use a recognized loader. |
| Provider credentials + telemetry healthy | PASS hermetic credentials; LIVE BLOCKED | Every provider named by `REQUIRED_HEALTHY_PROVIDERS` must be configured and `LIVE` with telemetry. |
| Browser contains no provider secrets | PASS source preflight; compiled bundle BLOCKED | `apps/web/.next/static` scan must pass after production build. |
| Runbook + rollback approved | BLOCKED | `release/approvals/runbook-rollback.json` must be changed to `APPROVED` by an authorized human; hashes must still match the docs. |
| Deployment evidence records release identity | WIRED; BLOCKED final evidence | Requires source commit SHA, genuine lock hash, immutable API/web image digests, redacted config hash, live verification and approvals. |

`tests/release-integration.mjs` proves the strict cluster/program/provider logic against deterministic mock infrastructure only. Its program addresses are test fixtures and are not PowerChain deployment evidence.

The canonical GitHub repository `powerchain-protocol/crisis-capital-network` was inspected during this pass and did not contain a `pnpm-lock.yaml`. No synthetic lockfile was introduced. `.github/workflows/bootstrap-lockfile.yml` provides an online, pinned-toolchain path to generate a lockfile artifact for human review and commit before the production release gate can become reproducible.

## Final packaged source validation

```text
Release/source invariant suite                         PASS
Hermetic intended-cluster/program/provider integration PASS
Required repository artifacts                          126 PASS
MJS syntax                                              17 files PASS
TypeScript/TSX transpile syntax                         46 files PASS
JSON parse                                              33 files PASS
SVG/XML parse                                           18 files PASS
YAML parse                                               4 files PASS
Browser source-secret preflight                        PASS
Frozen dependency lock gate                            FAIL-CLOSED (lockfile absent)
Runbook/rollback approval gate                         FAIL-CLOSED (approval PENDING)
Compiled browser-bundle secret gate                    FAIL-CLOSED (production build absent)
Production environment gate                            FAIL-CLOSED (target runtime/config absent)
```

## Release integrity improvement pass

Added and source-validated: provider telemetry expiry, two-provider production quorum policy, upgradeable-program executable fingerprints, production fingerprint pinning, CycloneDX SBOM generation, build provenance binding, rollback-target verification, canonical deployment-evidence integrity and previous-deployment hash chaining. Production-only gates remain blocked until genuine lockfile/build/deployment/provider/approval evidence exists.

## Release hardening II validation

Executed successfully in the artifact runtime:

```text
RPC failover + circuit breaker fixture             PASS
Provider quorum failure/recovery hysteresis        PASS
SLO warm-up / availability / p95 runtime           PASS
Release integration fixture                        PASS
Post-deploy canary fixture                         PASS
Deployment evidence + Ed25519 attestation chain    PASS
Release policy source validation                   PASS
Full-stack wiring                                   PASS
```

Production-only frozen install/build, real cluster/provider/program verification, human approvals and immutable image/signing-key evidence remain external release prerequisites and are not fabricated here.
