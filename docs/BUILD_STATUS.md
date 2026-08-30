# Build & Release Status

**Product:** PowerChain Relief  
**Canonical version:** 1.0.0  
**Status:** source architecture validated; production deployment not yet attested

## Validated source-level areas

The repository includes regression coverage for:

- repository layout;
- API contract/package graph;
- Solana API and runtime wiring;
- provider and wallet integration;
- capital-state invariants;
- release-policy logic;
- settlement reconciliation;
- double-entry ledger rules;
- program registry wiring;
- responsive website/dashboard;
- theme system;
- motion/reduced-motion support;
- WebSocket boundaries;
- documentation structure.

## Build-fix status

Historical workspace-resolution issues such as `TS2307` for the shared API contract have been addressed in the source layout by:

- exposing contract types from source;
- preserving runtime JS exports from `dist`;
- explicit prebuild/pretypecheck ordering;
- deterministic workspace build scripts;
- Node/pnpm version pinning.

These fixes are part of the repository baseline and are no longer maintained as a separate app-level README or “build fix” document.

## Production blockers

The following require real deployment evidence and must not be inferred from source:

- successful frozen install using the committed lockfile;
- target Node/pnpm production build;
- mainnet RPC credentials;
- expected Solana genesis;
- required program IDs;
- required program fingerprints;
- real deployment/upgrade approvals;
- durable production database/repository;
- production signer;
- immutable deployment evidence;
- live service URL and canary verification.

## Required production gate

```text
toolchain
  ↓
configuration validation
  ↓
mainnet/genesis verification
  ↓
RPC health + failover
  ↓
program deployment verification
  ↓
provider quorum
  ↓
SLO readiness
  ↓
durable storage + signer readiness
  ↓
human approval
  ↓
release attestation
```

Any unknown required condition keeps release readiness **NOT_READY**.
