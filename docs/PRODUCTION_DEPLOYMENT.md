# Production Deployment

## Required toolchain

- Node >= 24.20.0
- pnpm 11.24.0
- committed real `pnpm-lock.yaml`
- production secrets from a secret manager
- private/mainnet RPC/provider infrastructure

## Production gate

Run:

```bash
NODE_ENV=production \
POWERCHAIN_ENV=production \
pnpm check:production
```

The gate requires:

- Node version >= 24.20.0;
- `pnpm-lock.yaml` exists;
- both environment modes are `production`;
- `SOLANA_NETWORK=mainnet-beta`;
- `ALLOW_DEV_FALLBACK=false`;
- private Solana RPC or Helius configuration;
- `SOLANA_EXPECTED_GENESIS_HASH`;
- internal API token >= 32 characters;
- explicit non-wildcard CORS origins;
- required Launchpad program IDs;
- at least one credentialed market provider;
- keyless provider toggles disabled;
- no sensitive configured `NEXT_PUBLIC_*` values.

## Build pipeline

Recommended sequence:

```text
corepack enable
pnpm install --frozen-lockfile
pnpm check:source
pnpm typecheck
pnpm test
pnpm build
pnpm check:production
container build
staging deploy
smoke tests
mainnet deploy
```

## Deployment topology

Recommended:

```text
Internet
  |
  v
CDN / WAF / TLS
  |
  v
Next.js web
  |
 private/service network
  v
Fastify API
  |
  +--> private RPC / Helius
  +--> market providers
```

Do not expose the backend internal-origin token to browsers.

## Health probes

- liveness: `/api/v1/health`
- readiness: `/api/v1/ready`

Kubernetes/container orchestration should use readiness for traffic admission.

## Deployment evidence

Mainnet release notes should record:

- commit SHA
- dependency lock hash
- container image digest
- environment/deployment ID
- genesis hash
- program IDs
- provider configuration status
- validation results
- signer/custody approval
- rollback version

## Rollback

A rollback must not alter on-chain history. Roll back application binaries/configuration, preserve event/audit records, and reconcile any transaction with unknown outcome before retrying.

## Executable acceptance pipeline

Use `pnpm release:predeploy` before image promotion. It requires a real committed lockfile, frozen install, typecheck/test/build, production configuration, generated browser-bundle secret scan, and hash-bound runbook/rollback approval.

After deployment, set `RELEASE_API_URL` and run `pnpm release:postdeploy`. Strict readiness verifies the intended cluster, required Launchpad programs and required provider telemetry before `release:evidence` records commit/image/config/program/provider evidence.

See [Release Acceptance](RELEASE_ACCEPTANCE.md), [Deployment Evidence](DEPLOYMENT_EVIDENCE.md), and [Rollback](ROLLBACK.md).
