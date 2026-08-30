# PowerChain Crisis v1.0.0 — Release Hardening II

This cumulative hardening pass keeps the canonical product version at **1.0.0** and strengthens production release truth rather than expanding product scope.

## Added controls

- multi-endpoint Solana RPC failover with redacted endpoint telemetry;
- per-endpoint circuit breaker and cooldown;
- raw/effective market-provider quorum with hysteresis;
- strict readiness uses raw quorum, so hysteresis cannot hide a release-time failure;
- rolling API availability/p95 SLO endpoint and readiness gate;
- post-deploy canary that warms and validates the SLO window;
- canonical `config/release-policy.json` validation;
- required-program executable fingerprint change-control approval;
- Ed25519 deployment-evidence attestation with pinned public-key fingerprint;
- deployment evidence bindings for policy, canary and program change-control artifacts;
- website-origin proxy for `/api/v1/observability/slo`;
- operator console visibility for SLO state, quorum hysteresis and RPC endpoint/circuit status.

## Non-goals

These controls do not fabricate a production lockfile, deployed program IDs, provider credentials, approvals, immutable image digests or a signing key. The production gate remains blocked until those real deployment facts exist.
