# Testing and Validation

## Source-level checks

```bash
pnpm check:source
```

This runs the repository's source/runtime smoke checks without requiring every framework build artifact.

Current test groups:

- `tests/invariants.mjs`
- `tests/security.mjs`
- `tests/charts.mjs`
- `tests/solana-api.mjs`
- `tests/solana-runtime.mjs`
- `tests/full-stack.mjs`
- `tests/structure.mjs`

## Runtime smoke test

`tests/solana-runtime.mjs` stubs network calls and verifies:

- overview health/slot/block height/blockhash/version;
- Jupiter price and liquidity enrichment;
- RPC-authoritative supply/decimals;
- Token-2022 detection/extensions;
- provider telemetry.

It is a deterministic source-level smoke test, not a substitute for real devnet/mainnet integration tests.

## Dependency-backed gates

After `pnpm install`:

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Production configuration gate

```bash
NODE_ENV=production POWERCHAIN_ENV=production pnpm check:production
```

This intentionally fails when required mainnet configuration is missing.

## Manual integration checklist

- [ ] health 200
- [ ] readiness 200 on intended cluster
- [ ] overview slot advances
- [ ] genesis matches deployment target
- [ ] required programs verify executable
- [ ] explicit mint market resolves or returns explicit unavailable state
- [ ] token inspection classifies SPL / Token-2022 correctly
- [ ] website-origin proxy matches backend response
- [ ] provider secrets absent from browser source/network payloads
- [ ] WebSocket hello/snapshot/subscribe works
- [ ] Swagger/OpenAPI loads
- [ ] compatibility routes emit deprecation/successor headers

## Release evidence

Store validation output with the deployment artifact. Source checks prove source invariants; production build/integration checks prove target-environment readiness.

## Release acceptance integration tests

- `tests/release-integration.mjs` validates intended-cluster matching, required-program verification and credentialed provider telemetry against deterministic mocked upstreams.
- `tests/release-evidence-runtime.mjs` starts a deterministic local release API fixture, runs the actual live-verification script, records deployment evidence, and verifies that evidence. Fixture program addresses/credentials are never production evidence.
- `scripts/check-browser-secrets.mjs` can run as a source preflight; `--require-build` is mandatory for production and scans `apps/web/.next/static` only after a real Next.js build exists.
