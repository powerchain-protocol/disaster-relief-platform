# Troubleshooting

## `POWERCHAIN_API_URL_REQUIRED`

The Next.js server cannot find the backend origin.

Fix:

```env
POWERCHAIN_API_URL=http://localhost:4000
```

## `POWERCHAIN_API_PROXY_LOOP`

The web proxy is pointing back to the website origin.

Fix `POWERCHAIN_API_URL` so it points to the Fastify backend.

## `BACKEND_ORIGIN_AUTH_REQUIRED`

The backend has `POWERCHAIN_INTERNAL_API_TOKEN` configured but the caller did not provide the same token.

Preferred fix: call the same-origin website proxy.

## `MARKET_DATA_UNAVAILABLE`

No configured provider returned an acceptable price.

Check:

- provider credentials;
- `MARKET_PROVIDER_PRIORITY`;
- Pyth mint/feed map;
- upstream provider availability;
- token support;
- request mint correctness.

Do not convert this error into price `0`.

## `PWRC_MINT_NOT_CONFIGURED`

Only affects `/api/token/market` when no `mint` query parameter is supplied.

Set `PWRC_MINT` or migrate caller to explicit canonical v1 route.

## `UNSUPPORTED_TOKEN_PROGRAM`

The address exists but is not a mint owned by classic SPL Token or Token-2022.

Verify the address/cluster.

## Program shows `NOT_FOUND`

Check cluster and deployment evidence. Program IDs are cluster-specific.

## Program shows `INVALID_CONFIGURATION`

Configured ID is not a valid Solana public key.

## Token-2022 extension list is empty

Possible causes:

- mint has no extensions;
- RPC parser did not expose extension data;
- `extensionParsing` is `UNAVAILABLE`.

Do not infer extensions from missing parser data.

## Production gate says lockfile missing

Generate the lockfile with the pinned pnpm version in a networked target environment:

```bash
corepack enable
pnpm install
```

Commit the resulting `pnpm-lock.yaml`, then use frozen installs.

## Node version failure

Use Node >= 24.20.0. The artifact-building sandbox may use an older Node; that is not a valid production release environment.
