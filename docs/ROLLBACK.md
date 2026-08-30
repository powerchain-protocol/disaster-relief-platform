# Production Rollback

## Objective

Rollback restores a previously approved application/configuration release without rewriting on-chain history or hiding unresolved transaction state.

## Preconditions

- Identify the current deployment evidence record and the previously approved evidence record.
- Confirm the target rollback API and web image digests.
- Preserve database, event, audit, reconciliation, and evidence records.
- Freeze financial/on-chain execution when cluster identity, signer state, or transaction outcome is uncertain.

## Procedure

1. Set the incident/release state to `ROLLBACK_IN_PROGRESS`.
2. Disable new financial/on-chain execution if the incident can affect settlement correctness.
3. Redeploy the previously approved API and web image digests from its immutable deployment evidence record.
4. Restore only the matching non-secret configuration revision. Do not roll back secrets to an expired or revoked version.
5. Run `/api/v1/health` and strict `/api/v1/ready`.
6. Verify the intended Solana cluster/genesis hash.
7. Verify every required PowerChain Launchpad program.
8. Verify required provider telemetry is `LIVE`.
9. Reconcile every `EXECUTION_UNKNOWN` transaction before retrying it.
10. Record rollback evidence with the incident ID, from/to image digests, config hashes, operator approval, timestamps, and verification result.

## Abort conditions

Abort rollback and keep execution disabled if the intended cluster does not match, a required program is missing/unverified, provider truth is unavailable, the rollback image digest does not match its approved evidence, or unresolved transaction outcomes could be duplicated.

## Approval

`release/approvals/runbook-rollback.json` binds human approval to SHA-256 hashes of this document and `docs/OPERATIONS_RUNBOOK.md`. Any edit invalidates the prior approval and requires re-approval.

## Machine-verifiable rollback target

Pre-deploy acceptance now runs `pnpm release:rollback:check`. For upgrades, `RELEASE_ROLLBACK_EVIDENCE_FILE` must point to a previously verified production deployment evidence record on the same intended cluster. The gate verifies its tamper-evident payload, immutable API/web image digests, configuration digest and cluster identity, then writes `release/evidence/rollback-target.json` for inclusion in the new deployment evidence.

For the first production deployment only, set `RELEASE_INITIAL_DEPLOYMENT=true`. This explicit exception is itself recorded as evidence; it must not be combined with a rollback target file.
