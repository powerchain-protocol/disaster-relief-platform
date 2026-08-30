# API Architecture

## Design goals

The API is explicit about authority, freshness, idempotency and uncertainty.

### Canonical namespace

All first-class routes use `/api/v1`. Shorter routes are compatibility aliases only.

### Stable failures

Domain failures are machine-readable and should remain stable across UI changes. Examples include:

- `INVALID_SOLANA_SIGNATURE`
- `DURABLE_MUTATION_STORE_REQUIRED`
- `RELEASE_POLICY_FAILED`
- `EXECUTION_UNKNOWN`
- `SETTLEMENT_AMOUNT_MISMATCH`
- `SETTLEMENT_DESTINATION_MISMATCH`

### Idempotency

State-changing capital operations require `Idempotency-Key`. Reusing a key with a different request is rejected.

### Readiness

Liveness and readiness are intentionally separate. Production release tooling must consume strict readiness, not just HTTP 200 from health.

### WebSocket

The WebSocket is a convenience channel for fresh read-only snapshots. It never carries treasury execution.
