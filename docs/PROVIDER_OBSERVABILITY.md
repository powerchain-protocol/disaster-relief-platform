> See the complete documentation index in [`docs/README.md`](README.md).

# Provider Observability and Runtime Resilience

PowerChain treats provider configuration and provider health as separate states.

`GET /api/v1/providers/status` exposes **redacted** operational telemetry only:

- configured / unconfigured;
- capability;
- latest observed state;
- last checked timestamp;
- latency;
- consecutive failures;
- redacted error code;
- cache entry and in-flight request counts.

Provider URLs, API keys, Helius credentials and custom RPC endpoints are never returned.

## Request coalescing

Solana overview, market and asset reads use short-lived in-memory caches. When several requests miss the same cache key simultaneously, the service shares one in-flight Promise rather than sending duplicate upstream calls. This reduces RPC/provider stampedes during refresh bursts.

## Helius DAS isolation

Helius DAS calls use the explicitly configured Helius endpoint/API key even when `SOLANA_RPC_URL` points to another provider. Metadata enrichment therefore cannot accidentally send Helius-only RPC methods to a non-Helius node.

## UI polling

The web console:

- prevents overlapping refresh requests;
- polls less frequently while the page is hidden;
- refreshes immediately when the page becomes visible;
- preserves the last successful snapshot on transient errors;
- identifies stale snapshots instead of replacing them with zero/null placeholders;
- exposes manual refresh controls.

## Production gate

Production requires a pinned Solana genesis hash, explicit non-wildcard CORS origins, a strong backend-origin token, private RPC/Helius infrastructure, production market credentials, and required Launchpad program IDs. Keyless market modes must be disabled.

## Freshness expiry and quorum

Provider health is time-bounded. `PROVIDER_TELEMETRY_MAX_AGE_SECONDS` controls the maximum age of the most recent successful provider observation. A formerly live provider becomes `DEGRADED` with `TELEMETRY_STALE` after this window. `/api/v1/providers/status` reports `fresh`, `ageSeconds`, `freshnessLimitSeconds`, and a summary containing `liveMarketProviders`, `requiredQuorum`, and `quorumMet`.

Production strict readiness should set `REQUIRED_PROVIDER_QUORUM>=2` so a single market API cannot independently define operational market truth.

## RPC failover and circuit breaker

Solana RPC is no longer modeled as a single opaque endpoint. The backend accepts a primary `SOLANA_RPC_URL` plus comma-separated `SOLANA_RPC_FALLBACK_URLS`. RPC calls are attempted against healthy candidates in configured order. Endpoint URLs are never returned to clients; status uses redacted endpoint IDs derived from a SHA-256 fingerprint.

The runtime circuit breaker uses:

- `RPC_CIRCUIT_FAILURE_THRESHOLD` — consecutive failures before an endpoint is temporarily opened;
- `RPC_CIRCUIT_COOLDOWN_MS` — time an opened endpoint stays out of normal selection;
- `RPC_MAX_FAILOVER_ATTEMPTS` — maximum endpoints attempted for a single RPC operation;
- `SOLANA_RPC_TIMEOUT_MS` — per-endpoint request deadline.

`GET /api/v1/providers/status` exposes only endpoint ID, provider label, active state, circuit state, latency, failure count, cooldown remaining, last-check time and redacted error code. It never exposes the configured RPC URL.

## Provider quorum hysteresis

Runtime provider quorum has both a **raw** state and an **effective** state. The raw state reflects the current number of fresh live market providers. The effective state adds controlled hysteresis so a transient single poll cannot repeatedly flip operator-facing health between live and degraded.

- `PROVIDER_QUORUM_FAILURE_HYSTERESIS` controls how many consecutive raw failures are required before the effective quorum becomes false.
- `PROVIDER_QUORUM_RECOVERY_HYSTERESIS` controls how many consecutive passes are required to recover.

Strict production readiness and release verification remain fail-closed and require the **raw quorum** to pass; hysteresis is not allowed to hide an actual release-time quorum failure.
