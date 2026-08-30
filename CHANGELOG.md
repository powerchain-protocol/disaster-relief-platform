# Changelog

All notable changes to **PowerChain Relief v1.0.0** are recorded here. The canonical product version remains **1.0.0** while the implementation baseline is hardened.

## Unreleased — Repository & Program Assurance Upgrade

### Repository
- Consolidated product documentation at the repository root and under `docs/`.
- Removed redundant `apps/web/README.md`, `apps/backend/README.md`, and `programs/README.md`.
- Added `docs/BUILD_STATUS.md`.
- Reworked root `README.md` and `CONTRIBUTORS.md`.
- Removed the need for a separate “build fix status” narrative; historical build corrections are now part of the baseline.

### Programs
- Upgraded the canonical Solana program registry schema.
- Added explicit program family, authority domain, readiness class, deployment-evidence requirements and verification policy.
- Added `docs/PROGRAMS.md`.
- Preserved deployment-driven program IDs and SHA-256 executable fingerprints.
- Required programs remain `launchpad-registry`, `launch-policy`, and `token-factory`.
- Optional programs do not silently become readiness requirements.

### API / UI
- Program assurance UI continues to expose executable state, loader, ProgramData, deploy slot, upgrade authority and fingerprint status.
- No fabricated program IDs or deployment fingerprints are introduced.

## Previous implementation history

## Build Toolchain & Workspace Resolution — 2026-08-29

- Fixed `TS2307` for `@powerchain/crisis-api-contract` by exposing the contract source through the package `types` export.
- Added explicit `prebuild` / `pretypecheck` dependency builds for API client, backend, and web consumers.
- Added deterministic root build entrypoints for contracts, client, API, and web.
- Standardized Node.js on `24.20.0` LTS and pnpm on `11.24.0`.
- Updated TypeScript to `7.0.2` and Node 24 typings to `24.13.2`.
- Added pnpm 11 `allowBuilds` approvals for `esbuild` and `sharp` with `strictDepBuilds: true`.
- Added `tests/package-graph.mjs` and `docs/BUILD_TOOLCHAIN.md`.
- Corrected structure validation for the canonical `api/openapi/powerchain-disaster-relief.yaml` location.

## 1.0.0 — Improvement Layer — 2026-08-28

### Economic architecture

- Kept PWRC in the network-utility authority domain; no PWRC balance grants treasury authority.
- Added Power Units and reference utility service pricing.
- Defined the 5% successful-funding commission as a **post-success deduction from successful pool proceeds**, not a contributor checkout charge.
- Split the success commission into 2 percentage points for Community Treasury and 3 percentage points for Ecosystem & Development.
- Added atomic-integer fee calculation guidance and separate network/provider/token-transfer fee disclosure.

### Security

- Bound financial intents to quote hash, fee quote hash, policy version, fee schedule version, deployment, actor, organization and resource.
- Added a maximum quote TTL check.
- Added cross-chain route-version/replay-domain binding, transfer replay checks and projected wrapped-supply conservation.
- Added cumulative subject/organization reward limits, used-evidence replay detection and challenge holds.
- Kept all cross-chain routes non-LIVE in the overlay until deployment-specific verification exists.

### Token factory

- Added safer PROJECT / COMPANY / GOVERNMENT issuer profiles.
- Kept automatic mint disabled.
- Added reserve-backed issuance gates and Confidential Transfer production-review boundaries.
- Preserved the 1 SOL factory fee and 1B-unit values as configurable reference defaults, never automatic issuance facts.

### UI / documentation

- Added responsive PowerChain logo lockup with long-subtitle handling.
- Added verified icon/PWA assets from the supplied brand pack.
- Added reusable flow-chart components and six architecture SVGs.
- Added fee, deployment, cross-chain, token-factory, reward, UX, observability and security documentation.
- Added a 17-page PowerChain Crisis Capital Network v1.0.0 whitepaper and public `/docs/whitepaper.pdf` artifact.
- Nepal Flood Response remains explicitly marked demo-only.

### Architecture diagrams and charts

- Standardized architecture connectors to orthogonal routes with explicit arrowheads and edge labels.
- Added typed chart source modes and source/freshness metadata.
- Added a reusable accessible SVG line-chart primitive with semantic series states.
- Added canonical Nepal demo chart data with an explicit `DEMO ONLY` label and a production no-fallback rule.
- Rebuilt PWRC utility, fee stack, cross-chain, token-factory, community-reward and source-of-truth diagrams with clearer routing and status semantics.
### Chart / architecture visual-system hardening

- Replaced bare process strokes with marker-based arrowheads and independently typed edge states.
- Added orthogonal architecture routing, transition labels and mobile vertical process flows.
- Expanded chart source metadata with source IDs, observation/update time, freshness, stale state and explicit UNAVAILABLE handling.
- Upgraded line charts with latest-value summaries, previous-point deltas, point-quality semantics and an accessible hidden data table.
- Added reusable `ArchitectureMap` and `DataHealthStrip` components.
- Added `capital-lifecycle.svg` and `data-provenance.svg`; regenerated all exported architecture SVGs with accessible title/description and source/version footers.
- Added chart/architecture regression tests and a deterministic SVG generation script.


### Solana API endpoint upgrade

- Added canonical `GET /api/v1/solana/overview`, `/programs`, `/market?mint=`, and `/assets/:mint`.
- Added compatibility aliases `/api/solana/overview`, `/api/token/market`, and `/api/assets/:mint` using the same service layer.
- Added strict 32-byte base58 mint/program validation, no-store response policy, provider provenance/freshness, Pyth/Birdeye/Helius market observations and divergence detection.
- Added Helius DAS fungible asset lookup with authoritative RPC fallback; missing metadata remains `null` instead of synthetic.
- Added deployment-driven program registry, Postman collection, environment example and regression checks.

### Solana market-data refinement
- Made Solana RPC `getTokenSupply` authoritative for mint supply and decimals.
- Added Jupiter Price API V3 as the preferred display/reference source for USD price, 24-hour change, price block and reported decimals.
- Added optional Jupiter Tokens V2 liquidity enrichment; missing liquidity remains `null` rather than becoming a fabricated zero.
- Added price-block lag, RPC/Jupiter decimals consistency and provider-divergence degradation checks.
- Added `solana-market-data.svg` to the architecture library.
### Solana RPC / Launchpad / mint inspection / web proxy upgrade

- Expanded `/api/v1/solana/overview` with RPC latency, genesis hash, optional expected-genesis verification, latest blockhash/last-valid height and feature-set version.
- Upgraded `/api/v1/solana/programs` to verify configured PowerChain Launchpad and Crisis program accounts, executable state and loader metadata; no program ID is invented.
- Upgraded `/api/v1/solana/assets/:mint` with classic SPL vs Token-2022 inspection, mint/freeze authorities, initialization state, account length and RPC-parsed Token-2022 extensions.
- Added configurable Pyth/Jupiter/CoinGecko/CoinMarketCap/Birdeye/Helius market resolution while retaining `getTokenSupply` as on-chain supply/decimals authority.
- Kept canonical `/api/v1/solana/market` strict: `mint` is required. Compatibility `/api/token/market` alone may default to `PWRC_MINT`.
- Added matching Next.js website-origin proxies for all seven paths; provider/RPC secrets remain backend-only.
- Added runtime smoke coverage for overview, Jupiter market enrichment and Token-2022 mint inspection.


## Full-stack canonicalization

- Added pnpm workspace layout with Fastify backend, Next.js web runtime and typed API client.
- Added `/api/v1/health`, `/api/v1/ready`, `/api/v1/config/public`, `/api/v1/openapi.json` and bounded `/api/v1/ws/solana` snapshots.
- Added Helmet, CORS, global rate limiting, 1 MiB request ceiling, redacted logs and optional constant-time backend-origin token validation.
- Wired website-origin health/config/Solana proxies to the Fastify backend while keeping provider credentials backend-only.
- Added a responsive Solana operations console for cluster state, Launchpad/Crisis program verification, SPL/Token-2022 inspection and source-aware market resolution.
- Added `@powerchain/crisis-api-client`, Docker runtime definitions, full-stack documentation and production environment gates.
- Kept release version at v1.0.0 and did not manufacture a dependency lockfile when the package registry was unavailable.

### Architecture badge / connector fit hardening

- Made architecture status badges card-owned with bounded width and internal padding so badges cannot overflow node cards.
- Moved badge-bearing card titles/subtitles below the badge rail to prevent collisions.
- Replaced overlapping multi-branch connector paths with shared orthogonal rails; rails carry no arrowheads and only destination segments terminate in arrowheads.
- Routed connectors through whitespace and terminated them on card boundaries instead of allowing strokes through card content.
- Added node clipping and dynamic status-badge sizing to the reusable React `ArchitectureMap`.
- Added regression checks for badge containment, card-owned SVG groups, arrowheads, branch rails and no-gradient exports.

### Release acceptance hardening
- Added fail-closed pre-deploy and post-deploy release gates.
- Added strict readiness binding to intended network/genesis, required Launchpad programs, market warm-up, and required provider telemetry.
- Added frozen-lock validation, generated browser-bundle secret scanning, runbook/rollback hash-bound approval, live production verification, and deployment evidence capture.
- Docker builds now require `pnpm install --frozen-lockfile` and carry OCI revision/version labels.
- Added GitHub Actions production release gate for Node 24.20.0 / pnpm 11.24.0.

### Release acceptance integration hardening

- Added frozen-lockfile verification and pinned Node/pnpm release workflows.
- Added strict live readiness verification for intended Solana network/genesis, required programs and required provider telemetry.
- Added source + compiled-browser secret scanning and runbook/rollback cryptographic approval binding.
- Added deployment evidence generation binding commit, lock hash, immutable image digests, redacted config hash, program IDs, provider telemetry and approvals.
- Added deterministic release-integration tests plus a fail-closed evidence matrix that never treats test fixtures as production deployments.
- Added an online lockfile bootstrap workflow because no genuine `pnpm-lock.yaml` currently exists in the canonical repository.

## v1.0.0 release hardening — provider freshness, program fingerprints and provenance

- Added time-bounded provider telemetry with `fresh`, `ageSeconds`, `freshnessLimitSeconds`, and `TELEMETRY_STALE` degradation.
- Added `REQUIRED_PROVIDER_QUORUM` to strict readiness and live release verification.
- Added executable deployment fingerprints for required Solana programs, including UpgradeableLoader ProgramData parsing, deploy slot, ProgramData address and upgrade authority where available.
- Added production fingerprint pinning through `EXPECTED_PROGRAM_FINGERPRINTS_JSON`.
- Added CycloneDX 1.5 SBOM and release-provenance generation/verification after the production build.
- Added machine-verifiable rollback-target evidence with an explicit first-deployment exception.
- Added canonical SHA-256 integrity to release-acceptance and deployment-evidence records plus optional previous-deployment hash chaining.
- Changed release gate execution to short-circuit dependent checks and mark remaining steps `SKIPPED` after the first failure.

## Release hardening II — cumulative v1.0.0 improvement

- Added multi-endpoint Solana RPC failover with per-endpoint circuit breaker, cooldown and redacted endpoint IDs.
- Added raw/effective provider quorum with failure/recovery hysteresis; strict readiness still requires raw quorum.
- Added rolling API SLO/error-budget endpoint with availability and p95 latency targets.
- Added strict SLO readiness and post-deploy canary warm-up/verification.
- Added canonical `config/release-policy.json` and executable release-policy validation.
- Added required-program executable fingerprint change-control against previous verified deployment evidence.
- Added Ed25519 deployment-evidence attestation with pinned signer public-key SHA-256.
- Extended deployment evidence to bind release policy, canary and program change-control records.
- Added website-origin SLO proxy and operator-console SLO/quorum/RPC visibility.
