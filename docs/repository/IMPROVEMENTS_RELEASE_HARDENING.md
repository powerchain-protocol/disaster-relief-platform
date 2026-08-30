# PowerChain Crisis v1.0.0 — Release Hardening Improvements

This pass preserves version 1.0.0 and strengthens the existing release-ready integration.

## Implemented

- Expiring provider telemetry: stale successful checks degrade to `TELEMETRY_STALE`.
- Market-provider quorum in strict readiness and live release verification.
- Solana program executable SHA-256 fingerprints, including UpgradeableLoader ProgramData parsing.
- ProgramData address, deploy slot and upgrade authority reporting where available.
- Production fingerprint pinning through `EXPECTED_PROGRAM_FINGERPRINTS_JSON`.
- CycloneDX 1.5 SBOM generation after the frozen dependency-backed build.
- Release provenance binding lockfile, package manifests and API/web build-tree digests.
- Machine-verifiable rollback target against prior approved deployment evidence.
- Canonical SHA-256 integrity for acceptance/deployment evidence and optional previous-evidence hash chaining.
- Release gate short-circuiting with `SKIPPED` dependent steps after the first failure.
- Updated operator UI showing telemetry freshness/quorum and program fingerprints/upgrade authority.

## Production truth boundary

This artifact does not claim a successful production install/build/deployment. The production gate still requires Node 24.20.0, pnpm 11.24.0, a committed genuine `pnpm-lock.yaml`, real provider/RPC credentials, pinned live program fingerprints, authorized approval, immutable image digests, and a deployed API for post-deploy verification.
