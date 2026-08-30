# Contributing

## Before changing code

Understand the invariant you are changing. Important examples:

- supply/decimals come from Solana RPC;
- canonical market route requires explicit mint;
- compatibility aliases reuse canonical services;
- provider secrets remain backend-only;
- missing mainnet data is not demo/zero;
- PWRC utility does not confer financial authority;
- cross-chain/reward actions fail closed.

## Development workflow

```bash
pnpm check:source
pnpm typecheck
pnpm test
pnpm build
```

## API changes

When adding/changing an endpoint:

1. update service/domain first;
2. keep route transport thin;
3. update shared types/API client;
4. update same-origin Next.js proxy when public browser access is needed;
5. update OpenAPI/Postman;
6. add tests;
7. update docs/changelog.

## Compatibility aliases

Do not implement compatibility behavior in separate service code. Aliases should call canonical functions and provide deprecation/successor metadata.

## Provider integrations

New provider code must define:

- provenance metadata;
- freshness semantics;
- timeout;
- failure behavior;
- credential boundary;
- whether it is authoritative, corroborating or derived.

## Documentation discipline

Never document an unconfigured or unverified mainnet ID as deployed. Use `UNCONFIGURED`, `TBA`, `DISABLED` or `development-only` as appropriate.
