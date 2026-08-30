> See the complete documentation index in [`docs/README.md`](README.md).

# PowerChain Solana API v1.0.0

The Solana API separates chain truth, deployment verification, mint inspection and market-reference data. Canonical v1 routes live in the backend and are mirrored through same-origin Next.js GET proxies. Browser code never receives Helius, custom RPC, Pyth, CoinGecko or CoinMarketCap credentials.

## Canonical routes

```text
GET /api/v1/solana/overview
GET /api/v1/solana/programs
GET /api/v1/solana/market?mint=<address>
GET /api/v1/solana/assets/:mint
```

`/api/v1/solana/market` **always requires an explicit mint**. There is no implicit PWRC default on the canonical route.

## Compatibility aliases

```text
GET /api/solana/overview
GET /api/token/market?mint=<address>
GET /api/assets/:mint
```

The aliases call the exact same service functions. They are not alternate implementations and include `Deprecation: true` plus a successor `Link` header. Only `/api/token/market` may omit `mint`; when omitted it resolves `PWRC_MINT`. If neither is present it returns `PWRC_MINT_NOT_CONFIGURED` rather than guessing a token.

## `GET /api/v1/solana/overview`

Returns RPC/cluster state from the configured server-side RPC:

- `getHealth`
- `getSlot`
- `getBlockHeight`
- `getEpochInfo`
- `getVersion`
- `getLatestBlockhash`
- `getGenesisHash`
- `getSupply`

The response includes RPC latency, latest blockhash + last-valid block height, Solana core/feature-set version, slot/block height, epoch state, SOL supply and optional configured-genesis verification. Set `SOLANA_EXPECTED_GENESIS_HASH` when a deployment wants a strict cluster fingerprint; mismatch degrades the response.

## `GET /api/v1/solana/programs`

Verifies configured PowerChain program IDs against the selected cluster. The default registry covers PowerChain Launchpad primitives plus optional Crisis programs.

Launchpad bindings:

```text
SOLANA_LAUNCHPAD_REGISTRY_PROGRAM_ID
SOLANA_LAUNCH_POLICY_PROGRAM_ID
SOLANA_TOKEN_FACTORY_PROGRAM_ID
SOLANA_TOKEN_2022_VESTING_PROGRAM_ID
SOLANA_LAUNCHPAD_ESCROW_PROGRAM_ID
```

A deployment may supply `SOLANA_LAUNCHPAD_PROGRAM_REGISTRY_JSON` and/or `SOLANA_PROGRAM_REGISTRY_JSON` instead.

For every configured ID the API checks:

1. valid 32-byte Solana public key;
2. account exists on the selected cluster;
3. account is executable;
4. program owner/loader is recorded and classified when it matches a recognized loader.

The response exposes `deploymentVerified`, loader, owner, lamports and account data length. Missing IDs are `UNCONFIGURED`; absent accounts are `NOT_FOUND`; malformed/non-executable/non-loader accounts are `INVALID_CONFIGURATION`. No deployment ID is fabricated.

## `GET /api/v1/solana/assets/:mint`

Mint inspection deliberately treats Solana RPC as authoritative.

```text
getTokenSupply
  -> supplyAtomic
  -> uiAmountString
  -> decimals

getAccountInfo(base64/jsonParsed)
  -> owner program
  -> initialized state
  -> mint authority
  -> freeze authority
  -> Token-2022 extensions
  -> account-data length
```

The API distinguishes:

- `SPL_TOKEN` — classic SPL Token program;
- `TOKEN_2022` — Token Extensions program;
- `UNKNOWN` — rejected with `UNSUPPORTED_TOKEN_PROGRAM`.

Token-2022 extension names/details are sourced from Solana RPC `jsonParsed` output when available. Helius DAS remains optional metadata enrichment for name, symbol, image, interface and metadata URI; it cannot override RPC supply, decimals or authorities.

## `GET /api/v1/solana/market?mint=<address>`

Market resolution always begins with on-chain supply/decimals and then resolves price observations by configurable priority.

Default priority:

```text
Pyth Hermes
    ↓
Jupiter Price API V3
    ↓
CoinGecko
    ↓
CoinMarketCap
    ↓
Birdeye
    ↓
Helius DAS
```

Configure with `MARKET_PROVIDER_PRIORITY`.

### Authority split

```text
Solana RPC getTokenSupply
  -> on-chain supply / decimals

Pyth / Jupiter / CoinGecko / CoinMarketCap / Birdeye / Helius
  -> display/reference price observations

Jupiter Tokens V2 / CoinMarketCap / Birdeye
  -> liquidity enrichment when available
```

Pyth uses the mint-to-feed mapping in `PYTH_MINT_FEED_MAP_JSON` and authenticated Hermes access. CoinGecko resolves token price by Solana contract address. CoinMarketCap uses its Solana DEX token-price endpoint by address. Provider timestamps/freshness are preserved where available.

The resolver returns:

- selected primary provider;
- configured provider priority;
- all valid observations;
- USD price;
- 24h change when a provider supplies it;
- liquidity, 24h volume and market cap when available;
- Jupiter price block/current slot/block lag when Jupiter responds;
- cross-provider divergence in basis points;
- `LIVE` or `DEGRADED` state.

Missing liquidity/volume/market-cap stays `null`; missing price from all configured providers returns `MARKET_DATA_UNAVAILABLE`. A market response is `DISPLAY_AND_ANALYTICS_ONLY`; financial execution must use immutable expiring financial quotes bound to policy/fee versions.

## Website-origin Next.js proxies

The overlay includes matching Next.js route handlers:

```text
apps/web/app/api/v1/solana/overview/route.ts
apps/web/app/api/v1/solana/programs/route.ts
apps/web/app/api/v1/solana/market/route.ts
apps/web/app/api/v1/solana/assets/[mint]/route.ts
apps/web/app/api/solana/overview/route.ts
apps/web/app/api/token/market/route.ts
apps/web/app/api/assets/[mint]/route.ts
```

They forward GET requests to `POWERCHAIN_API_URL`, preserve query parameters and selected response headers, force `no-store`, and optionally add a server-only `POWERCHAIN_INTERNAL_API_TOKEN`. They do **not** read or forward Helius/RPC/Pyth/CoinGecko/CoinMarketCap keys from browser input.

Do not point `POWERCHAIN_API_URL` at the website origin; the proxy detects a same-origin loop and fails closed.

## Production configuration

See `config/solana-api.env.example`. Mainnet must use configured/private RPC infrastructure. Public Solana RPC remains development-only. Provider keys and custom RPC URLs are backend/server environment variables and never `NEXT_PUBLIC_*` variables.

## Provider status

`GET /api/v1/providers/status` reports redacted runtime telemetry for Solana RPC and configured market/metadata providers. It includes configuration state, capability, last observed state, latency, consecutive failures and redacted error codes, but never provider URLs or API credentials.

The service coalesces concurrent cache misses for the same overview/market/asset key so refresh bursts do not create duplicate upstream requests. Helius DAS uses its own Helius endpoint even when `SOLANA_RPC_URL` points to a different provider.

## Market quality gates

Market status degrades when any configured source is stale, configured price providers diverge beyond `PRICE_DIVERGENCE_BPS`, Jupiter price block lag exceeds `JUPITER_MAX_BLOCK_LAG`, Jupiter decimals disagree with RPC `getTokenSupply`, or Pyth confidence exceeds `PYTH_MAX_CONFIDENCE_BPS`.

RPC remains authoritative for token supply and decimals.

## Deployment fingerprints

`GET /api/v1/solana/programs` now reports `deploymentFingerprintSha256` for verified programs. For `BPFLoaderUpgradeable` programs, PowerChain resolves the ProgramData account and fingerprints the executable program bytes rather than only hashing the small Program account. Where available it also returns `programDataAddress`, `lastDeploySlot`, and `upgradeAuthority`.

Production readiness compares required program fingerprints with `EXPECTED_PROGRAM_FINGERPRINTS_JSON`; a valid program ID with unexpected executable bytes does not pass readiness.

## Provider freshness and quorum

`GET /api/v1/providers/status` reports per-provider `fresh`, `ageSeconds`, and `freshnessLimitSeconds` plus a summary with `liveMarketProviders`, `requiredQuorum`, and `quorumMet`. A provider whose last successful telemetry observation ages past `PROVIDER_TELEMETRY_MAX_AGE_SECONDS` degrades to `TELEMETRY_STALE` even if its last request succeeded.
