# Build Toolchain

PowerChain Crisis v1.0.0 uses the production LTS toolchain:

- Node.js `24.20.0` LTS
- pnpm `11.24.0`
- TypeScript `7.0.2`
- Next.js `16.3.2`
- React / React DOM `19.2.8`
- Fastify `5.12.1`
- tsx `4.23.12`

## Workspace contract resolution

`@powerchain/crisis-api-contract` is a workspace package used only for shared API response contracts. Its package export exposes `src/index.ts` through the TypeScript `types` condition, while runtime JavaScript remains emitted to `dist/`. This allows a consumer such as `@powerchain/crisis-api-client` to typecheck even when the contract package has not yet emitted `dist/index.d.ts`.

Consumer packages also run the required upstream build in `prebuild` / `pretypecheck`, so direct commands such as:

```bash
pnpm --filter @powerchain/crisis-api-client build
pnpm --filter @powerchain/crisis-api build
pnpm --filter @powerchain/crisis-web build
```

do not depend on accidental workspace build order.

## pnpm 11 build approvals

`pnpm-workspace.yaml` uses pnpm 11 `allowBuilds`. Approved install/build-script dependencies are deliberately narrow:

```yaml
allowBuilds:
  esbuild: true
  sharp: true
strictDepBuilds: true
```

`esbuild` is required by `tsx`; `sharp` is used by Next.js image tooling where installed. Any newly introduced dependency with an install/build script fails installation until explicitly reviewed.

## Clean build

```bash
corepack enable
corepack prepare pnpm@11.24.0 --activate
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Production should use `pnpm install --frozen-lockfile` after a genuine `pnpm-lock.yaml` has been generated and committed from a registry-connected environment.
