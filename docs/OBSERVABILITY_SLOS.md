# Observability & SLOs — v1.0.0

The targets below are **operational objectives**, not current-production claims.

| Signal | Objective | Failure behavior |
| --- | ---: | --- |
| Public API availability | 99.9% monthly | status page + degraded mode |
| Authenticated API p95 | < 500 ms excluding external settlement | trace slow dependencies |
| RPC health probe | < 8 s hard timeout | mark provider degraded/unavailable |
| Helius/event ingestion | p95 < 30 s | durable retry + idempotency |
| Settlement reconciliation | p95 < 90 s after confirmed tx | `EXECUTION_UNKNOWN`, retry |
| Evidence verification backlog | operator-defined by crisis severity | alert before SLA breach |
| Bridge reconciliation | provider-specific | pause route on invariant breach |

## Required telemetry

- request ID / trace ID;
- tenant and actor IDs as privacy-safe identifiers;
- route and policy version;
- RPC/provider identity and latency;
- transaction signature only where appropriate;
- event idempotency key;
- queue age/retry count;
- reconciliation result;
- evidence verification backlog;
- risk/hold counts by reason;
- no secrets, raw private evidence or wallet signing material in logs.

## Release/readiness SLO gates

- Required provider telemetry age: <= `PROVIDER_TELEMETRY_MAX_AGE_SECONDS` (production range 15-300 seconds).
- Market corroboration: at least `REQUIRED_PROVIDER_QUORUM` live market-price providers; production minimum is 2.
- Required program identity: program ID + loader + SHA-256 executable fingerprint must match the pinned production manifest.
- Deployment evidence: canonical payload digest verification must be 100% successful before promotion evidence is accepted.

## Executable rolling SLO gate

The API exposes `GET /api/v1/observability/slo`. The endpoint reports a rolling request window with:

- sample count and minimum sample requirement;
- availability percentage and target;
- p95 latency and target;
- `evaluable` state while the window is warming;
- explicit availability, latency and combined SLO pass/fail state.

Health, readiness, Swagger and the SLO endpoint itself are excluded from the service-level sample set so probes cannot artificially improve or degrade application SLOs.

Production can set `READINESS_REQUIRE_SLO=true`. In that mode strict readiness remains `NOT_READY` until the sample window is evaluable and both availability and p95 latency are within target. The release canary warms the sample window before final live verification.
