# Capital Domain API

The capital API uses atomic integer strings and explicit state transitions.

## Endpoints

- `POST /api/v1/capital/intents`
- `GET /api/v1/capital/intents/:id`
- `POST /api/v1/capital/intents/:id/transitions`
- `POST /api/v1/capital/intents/:id/evidence`
- `POST /api/v1/capital/intents/:id/approvals`
- `POST /api/v1/capital/intents/:id/release-review`
- `POST /api/v1/capital/intents/:id/release-prepare`

All state-changing calls require an `Idempotency-Key`.

## Invariants

`verifiedImpact <= delivered <= spent <= released <= escrowed <= allocated <= available <= raised`

A release review evaluates amount, escrow, approvals, required roles, verified evidence, signer readiness and optional release caps. `release-prepare` changes the intent to `RELEASE_READY`; it does not broadcast a Solana transaction and does not claim settlement.

## Persistence

The included repository is intentionally `IN_MEMORY_DEVELOPMENT_ONLY`. Production state-changing routes fail closed until a durable repository adapter is implemented and configured.


## Settlement lifecycle

- `POST /api/v1/capital/intents/:id/settlements/prepare`
- `POST /api/v1/capital/intents/:id/settlements/:executionId/submit`
- `POST /api/v1/capital/intents/:id/settlements/:executionId/unknown`
- `POST /api/v1/capital/intents/:id/settlements/:executionId/reconcile`

Lifecycle:

`PREPARED → SUBMITTED → CONFIRMING → RECONCILED`

If submission occurred but final chain outcome cannot be established, the state is `EXECUTION_UNKNOWN`. Unknown execution is not treated as failure and must not be retried as a new payment until reconciled.

A finalized observation must match the prepared signature, amount and destination. Only after reconciliation does the capital engine advance `RELEASE_READY → RELEASED` and create a balanced double-entry journal.

## Ledger

Every generated journal must satisfy `total debits = total credits`. Atomic integer values are used throughout.

## Authority

Wallet connectivity and PWRC balances are non-authority signals. Treasury execution requires authenticated identity, role, policy permission, approval threshold and signer readiness.
