# Deployment Evidence

Every production promotion produces a machine-readable record under `release/evidence/`.

## Required bindings

| Binding | Requirement |
| --- | --- |
| Release | `1.0.0` |
| Commit | immutable Git commit SHA |
| Dependencies | SHA-256 of committed `pnpm-lock.yaml` |
| SBOM | CycloneDX 1.5 artifact SHA-256 |
| Provenance | release-provenance artifact and canonical payload SHA-256 |
| API image | immutable `sha256:` digest |
| Web image | immutable `sha256:` digest |
| Configuration | SHA-256 of approved non-secret configuration revision |
| Cluster | intended network + observed/expected genesis |
| Programs | required slug, program ID, loader, code fingerprint, ProgramData/deploy slot/upgrade authority where available |
| Providers | capability, required flag, state, freshness, age, latency and last check |
| Quorum | required and observed live market-provider count |
| Rollback | verified prior deployment evidence, or explicit first-deployment exception |
| Approvals | hash-bound runbook/rollback approval |
| Verification | pre-deploy and live post-deploy result |
| Integrity | canonical evidence payload SHA-256 + optional previous-payload hash chain |

Do not store secret values in the evidence record. Store only identifiers, boolean configuration state, approved non-secret policy values and cryptographic digests.

## Supply-chain artifacts

After the production build, `release:sbom` produces `release/evidence/sbom.cdx.json` and `release:provenance` produces `release/evidence/release-provenance.json`. The provenance record binds the dependency lock, package manifests and deterministic API/web build-tree digests. `release:artifacts:verify` must pass before the environment gate.

## Tamper evidence

The final evidence object is canonicalized with lexicographically sorted JSON object keys and hashed with SHA-256. `verify-deployment-evidence.mjs` recomputes the digest and verifies all local bound artifacts. If `RELEASE_PREVIOUS_EVIDENCE_FILE` is supplied, the new evidence also binds the previous evidence payload digest, creating a forward audit chain.

## Release policy, canary and signed attestation bindings

Deployment evidence now binds three additional release facts:

1. the validated canonical release-policy artifact;
2. required-program fingerprint change-control evidence;
3. the successful canary verification report.

The immutable evidence JSON remains hash-chained with a canonical SHA-256 payload digest. After it is recorded, `scripts/sign-deployment-evidence.mjs` creates a separate Ed25519 attestation sidecar. The sidecar signs the deployment ID, canonical evidence payload hash and evidence-file hash. The public-key SHA-256 is pinned with `RELEASE_ATTESTATION_PUBLIC_KEY_SHA256`; private signing material is never written to evidence.

`RELEASE_REQUIRE_ATTESTATION=true` makes final evidence verification fail if the attestation is missing, signed by an unexpected key, bound to a different evidence file or cryptographically invalid.
