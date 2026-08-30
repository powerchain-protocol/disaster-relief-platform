# PowerChain Crisis v1.0.0 — Release Acceptance Status

The release pipeline is fully wired and fail-closed. This artifact validates the release-control implementation with deterministic fixtures; it does **not** fabricate production deployment facts.

| Gate | Artifact status | Production PASS requirement |
| --- | --- | --- |
| Source/economic/security tests | PASS | source suite remains green |
| Solana runtime integration | PASS | real RPC on intended cluster |
| Provider freshness expiry | PASS | required providers fresh within configured maximum age |
| Market provider quorum | PASS fixture | at least `REQUIRED_PROVIDER_QUORUM` live market providers |
| Program code fingerprinting | PASS fixture | live program fingerprints equal pinned production manifest |
| Release evidence integrity | PASS | canonical payload hash verifies |
| SBOM/provenance wiring | PASS source | generated after real frozen install/build |
| Rollback-target verification | PASS source | prior approved deployment evidence, or explicit initial-deploy exception |
| Frozen dependency install | BLOCKED here | committed `pnpm-lock.yaml` + Node 24.20.0 + pnpm 11.24.0 |
| Typecheck/test/build | BLOCKED here | dependency-backed CI run |
| Production configuration | BLOCKED here | real secrets, program IDs/fingerprints, cluster and quorum policy |
| Live readiness/program/providers | BLOCKED here | deployed API and production credentials |
| Browser bundle secret scan | BLOCKED here | real Next.js build output |
| Human runbook/rollback approval | BLOCKED here | authorized approver record |
| Immutable deployment evidence | BLOCKED here | real commit, image digests, config, live verification and approvals |

No blocked gate is reported as passed.

## Additional release-hardening gates

| Gate | Artifact status | Production requirement |
| --- | --- | --- |
| RPC failover/circuit behavior | PASS fixture | at least two distinct private RPC endpoints |
| Raw/effective quorum hysteresis | PASS runtime | raw quorum must pass strict readiness; effective quorum stabilizes operator health |
| Rolling SLO evaluator | PASS runtime | evaluable window within availability/p95 targets |
| Post-deploy canary | PASS fixture | configured production samples all pass and final readiness/SLO are green |
| Program fingerprint change-control | PASS initial/no-change paths | approved exact from/to fingerprint record when a required program changes |
| Ed25519 evidence attestation | PASS fixture | CI signing key + pinned public-key SHA-256 |
| Release-policy validation | PASS | canonical policy remains v1.0.0 and matches toolchain/security baseline |
