# Build Fix Status — PowerChain Crisis v1.0.0

## Fixed

The API client no longer fails with:

```text
TS2307: Cannot find module '@powerchain/crisis-api-contract'
```

`@powerchain/crisis-api-contract` now exposes `src/index.ts` as its TypeScript `types` export, while runtime output remains `dist/index.js`. Consumers also build upstream workspace dependencies in `prebuild` / `pretypecheck`.

## Toolchain

- Node.js: `24.20.0` LTS
- pnpm: `11.24.0`
- TypeScript: `7.0.2`
- `@types/node`: `24.13.2` (Node 24 line)
- Next.js: `16.3.2`
- React / React DOM: `19.2.8`
- Fastify: `5.12.1`
- tsx: `4.23.12`

## pnpm build approvals

```yaml
allowBuilds:
  esbuild: true
  sharp: true
strictDepBuilds: true
```

This is intentionally an allowlist. Any newly introduced dependency build script remains blocked until reviewed.

## Validation performed in this workspace

- `@powerchain/crisis-api-contract` TypeScript emit: PASS with available TypeScript 5.8.3.
- `@powerchain/crisis-api-client` TypeScript emit: PASS with the contract `dist/` deleted, proving source-type resolution fixes the reported TS2307.
- Dependency-free repository/runtime regression suite: PASS.
- Package-graph/build-approval regression: PASS.
- Repository layout regression: PASS.

## Environment limitation

This sandbox runs Node 22.16.0 and cannot reach the npm registry, so it cannot truthfully execute pnpm 11.24.0 installation, TypeScript 7.0.2 compilation, Next production build, or Fastify dependency-backed boot. Run the commands below in the target Node 24 environment after installing dependencies.

```bash
corepack enable
corepack prepare pnpm@11.24.0 --activate
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

After committing the genuine lockfile, CI/production should use:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```
