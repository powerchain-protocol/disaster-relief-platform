# Release Acceptance Pipeline

PowerChain Crisis v1.0.0 uses two fail-closed promotion phases. The pipeline separates **build truth** from **live deployment truth** and produces cryptographically bound evidence for both.

## Pre-deploy

```bash
pnpm release:predeploy
```

The gate requires, in order:

1. canonical `pnpm-lock.yaml` and workspace importers;
2. `pnpm install --frozen-lockfile`;
3. workspace typecheck;
4. tests;
5. production builds;
6. CycloneDX SBOM generation;
7. release provenance generation binding the lockfile, manifests and API/web build outputs;
8. SBOM/provenance verification;
9. production environment gate;
10. scan of generated Next.js browser chunks for provider/RPC/internal-token secrets;
11. current human approval for the Operations Runbook and Rollback procedure;
12. a verified rollback target from prior deployment evidence, unless this is explicitly the first production deployment.

A production image must never be built with `--no-frozen-lockfile`.

## Post-deploy

```bash
RELEASE_API_URL=https://... pnpm release:postdeploy
```

The live gate requires:

- readiness is true on the intended cluster and expected genesis hash;
- every required Launchpad program is `DEPLOYED`, executable under a recognized loader, and matches its pinned `deploymentFingerprintSha256`;
- every provider in `REQUIRED_HEALTHY_PROVIDERS` is configured, `LIVE`, **fresh**, and within `PROVIDER_TELEMETRY_MAX_AGE_SECONDS`;
- `REQUIRED_PROVIDER_QUORUM` independent live market-price providers are available;
- deployment evidence can bind live state to commit, lock, SBOM, provenance, immutable images, redacted config, rollback target and human approval.

## Program fingerprint pinning

Production configuration must provide `EXPECTED_PROGRAM_FINGERPRINTS_JSON` for `launchpad-registry`, `launch-policy`, and `token-factory`. Upgradeable programs are fingerprinted from the ProgramData executable bytes; the verification response also reports ProgramData address, last deploy slot, and upgrade authority when available.

## Provider freshness and quorum

Provider telemetry is not permanently healthy after one successful request. A `LIVE` provider becomes `DEGRADED` with `TELEMETRY_STALE` when its latest successful observation exceeds `PROVIDER_TELEMETRY_MAX_AGE_SECONDS`. Strict readiness additionally requires the configured market-provider quorum.

## Evidence

`pnpm release:evidence` writes a tamper-evident JSON record under `release/evidence/`. The record contains a canonical SHA-256 payload digest and can chain to a previous approved deployment evidence payload. It intentionally contains no provider keys, RPC URLs, passwords, signer secrets or internal API tokens.

## Local / CI distinction

Hermetic tests verify the gate logic using deterministic Solana/provider fixtures. They are not production evidence. A production PASS exists only when the real frozen install/build and live post-deploy verification execute in the target release environment.

## Hardened acceptance additions

The pre-deploy sequence now validates the canonical `config/release-policy.json`, then verifies production configuration, browser-secret isolation, runbook/rollback approval, rollback target and required-program fingerprint change-control.

The post-deploy sequence is:

```text
canary verification
  -> live cluster/program/provider/SLO verification
  -> deployment evidence record
  -> Ed25519 deployment attestation
  -> evidence + attestation verification
```

The canary requires a configured sample count, success ratio and zero/unconfigured maximum consecutive failures. It warms the rolling SLO window by reading the operational Solana endpoints before evaluating final readiness.

Program executable fingerprint changes between a previous verified deployment and the new expected fingerprints require a dedicated approved change-control record. Unchanged fingerprints do not require a synthetic approval.
