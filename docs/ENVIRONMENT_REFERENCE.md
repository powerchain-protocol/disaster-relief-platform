# Environment Reference

Environment variables are split by runtime. Provider/RPC secrets belong in `apps/backend/.env`. The web application receives only the backend origin and optional internal-origin token.

## Runtime / HTTP

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | development | Node runtime mode |
| `POWERCHAIN_ENV` | development | PowerChain deployment mode |
| `PORT` | 4000 | API port |
| `HOST` | `0.0.0.0` | API bind host |
| `LOG_LEVEL` | info | Fastify logging level |
| `CORS_ORIGINS` | empty | Comma-separated allowed browser origins |
| `API_RATE_LIMIT_PER_MINUTE` | 180 | Global HTTP rate limit |
| `POWERCHAIN_INTERNAL_API_TOKEN` | empty | Server-to-server origin token for protected Solana routes |

Production requires an internal token of at least 32 characters and explicit non-wildcard CORS origins.

## Solana / RPC

| Variable | Purpose |
| --- | --- |
| `SOLANA_NETWORK` | `mainnet-beta`, `devnet`, or `testnet` |
| `SOLANA_RPC_URL` | Explicit RPC URL |
| `SOLANA_RPC_PROVIDER` | Human-readable provider label |
| `SOLANA_EXPECTED_GENESIS_HASH` | Cluster-binding control |
| `HELIUS_RPC_URL` | Optional Helius RPC URL |
| `HELIUS_API_KEY` | Optional Helius credential |
| `ALLOW_DEV_FALLBACK` | Permit public development RPC only outside production |
| `PWRC_MINT` | Optional public PWRC mint for legacy market alias |

Production requires private/configured RPC infrastructure and `ALLOW_DEV_FALLBACK=false`.

## Market resolution

| Variable | Purpose |
| --- | --- |
| `MARKET_PROVIDER_PRIORITY` | Ordered provider list |
| `PRICE_DIVERGENCE_BPS` | Cross-provider price divergence threshold |
| `JUPITER_API_BASE_URL` | Jupiter API origin |
| `JUPITER_API_KEY` | Jupiter credential |
| `JUPITER_ALLOW_KEYLESS` | Development-only keyless mode |
| `JUPITER_TOKENS_LIQUIDITY_ENABLED` | Enable Tokens V2 liquidity enrichment |
| `JUPITER_MAX_BLOCK_LAG` | Maximum acceptable price-block lag |
| `PYTH_HERMES_URL` | Hermes API origin |
| `PYTH_API_KEY` | Pyth/Hermes credential |
| `PYTH_MINT_FEED_MAP_JSON` | Mint -> feed mapping JSON |
| `PYTH_MAX_AGE_SECONDS` | Pyth freshness ceiling |
| `PYTH_MAX_CONFIDENCE_BPS` | Maximum confidence interval ratio |
| `COINGECKO_API_BASE_URL` | CoinGecko origin |
| `COINGECKO_API_KEY` | CoinGecko credential |
| `COINGECKO_ALLOW_KEYLESS` | Non-production fallback toggle |
| `COINGECKO_MAX_AGE_SECONDS` | Freshness limit |
| `COINMARKETCAP_API_BASE_URL` | CoinMarketCap origin |
| `COINMARKETCAP_API_KEY` | CoinMarketCap credential |
| `COINMARKETCAP_ALLOW_KEYLESS` | Non-production fallback toggle |
| `COINMARKETCAP_MAX_AGE_SECONDS` | Freshness limit |
| `BIRDEYE_API_BASE_URL` | Birdeye origin |
| `BIRDEYE_API_KEY` | Birdeye credential |

Allowed provider names in priority order:

```text
PYTH
JUPITER_PRICE_V3
COINGECKO
COINMARKETCAP
BIRDEYE
HELIUS_DAS
```

Jupiter Tokens V2 is used as liquidity enrichment and is not selected as the primary price source.

## Program registries

Individual Launchpad variables:

```env
SOLANA_LAUNCHPAD_REGISTRY_PROGRAM_ID=
SOLANA_LAUNCH_POLICY_PROGRAM_ID=
SOLANA_TOKEN_FACTORY_PROGRAM_ID=
SOLANA_TOKEN_2022_VESTING_PROGRAM_ID=
SOLANA_LAUNCHPAD_ESCROW_PROGRAM_ID=
```

Crisis/general program variables:

```env
SOLANA_FUNDINGS_PROGRAM_ID=
SOLANA_STABLECOIN_PROGRAM_ID=
SOLANA_ORACLES_PROGRAM_ID=
SOLANA_SUPPLY_CHAIN_PROGRAM_ID=
```

Registry arrays:

```env
SOLANA_LAUNCHPAD_PROGRAM_REGISTRY_JSON=[]
SOLANA_PROGRAM_REGISTRY_JSON=[]
```

Do not invent missing mainnet IDs. Unconfigured is a valid explicit state.

## Web server

```env
POWERCHAIN_API_URL=http://localhost:4000
POWERCHAIN_INTERNAL_API_TOKEN=
```

No Helius/Pyth/Jupiter/etc. credential should appear in `apps/web/.env.local` or any `NEXT_PUBLIC_*` variable.

## Release-hardening and SLO variables

| Variable | Purpose |
| --- | --- |
| `SOLANA_RPC_FALLBACK_URLS` | Comma-separated private RPC fallbacks. URLs never appear in browser/API telemetry. |
| `RPC_CIRCUIT_FAILURE_THRESHOLD` | Consecutive endpoint failures before the circuit opens. |
| `RPC_CIRCUIT_COOLDOWN_MS` | Circuit open cooldown before the endpoint can be retried. |
| `RPC_MAX_FAILOVER_ATTEMPTS` | Maximum RPC candidates attempted per operation. |
| `PROVIDER_QUORUM_FAILURE_HYSTERESIS` | Consecutive raw quorum failures required to drop effective runtime quorum. |
| `PROVIDER_QUORUM_RECOVERY_HYSTERESIS` | Consecutive raw passes required to recover effective runtime quorum. |
| `READINESS_REQUIRE_SLO` | Requires rolling SLO to be evaluable and healthy in strict readiness. |
| `SLO_WINDOW_SECONDS` | Rolling SLO observation window. |
| `SLO_MIN_SAMPLES` | Minimum service samples before SLO becomes evaluable. |
| `SLO_AVAILABILITY_TARGET_PCT` | Availability target percentage. |
| `SLO_P95_TARGET_MS` | p95 latency target. |
| `RELEASE_CANARY_SAMPLES` | Number of post-deploy canary cycles. |
| `RELEASE_ATTESTATION_PUBLIC_KEY_SHA256` | Pinned SHA-256 of authorized Ed25519 release signer public key. |
| `RELEASE_ATTESTATION_PRIVATE_KEY_FILE` | CI-only path to the Ed25519 private signing key. Never commit it. |
| `RELEASE_PROGRAM_CHANGE_APPROVAL_FILE` | Approval record used when required program fingerprints change. |
