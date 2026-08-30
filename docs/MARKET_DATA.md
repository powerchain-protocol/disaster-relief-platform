# Market Data Resolution

## Principle

Market APIs provide display/analytics observations. They do not define token supply, decimals, treasury authority or transaction settlement.

The response explicitly states:

```text
use = DISPLAY_AND_ANALYTICS_ONLY
```

## On-chain source

Before market resolution, PowerChain queries:

```text
Solana RPC
  -> getTokenSupply
  -> supplyAtomic
  -> decimals
  -> current slot
```

## Provider priority

Default:

```text
Pyth
  -> Jupiter Price V3
  -> CoinGecko
  -> CoinMarketCap
  -> Birdeye
  -> Helius DAS
```

Configure with `MARKET_PROVIDER_PRIORITY`.

## Jupiter

Jupiter Price V3 may contribute:

- USD price
- 24h price change
- price block ID
- reported decimals

Jupiter Tokens V2 may enrich liquidity. Liquidity remains nullable when unavailable.

## Pyth

Pyth/Hermes requires a mint -> feed mapping through `PYTH_MINT_FEED_MAP_JSON`.

Validation gates include:

- freshness (`PYTH_MAX_AGE_SECONDS`)
- confidence ratio (`PYTH_MAX_CONFIDENCE_BPS`)

A large confidence interval degrades the aggregate response.

## CoinGecko / CoinMarketCap / Birdeye / Helius

These providers are corroboration/fallback observations and may contribute price, 24h change, liquidity, volume or market cap depending on their response.

## Divergence

When multiple price observations exist:

```text
divergenceBps = (maxPrice - minPrice) / minPrice * 10,000
```

If divergence exceeds `PRICE_DIVERGENCE_BPS`, the response becomes `DEGRADED`.

## Jupiter block lag

If Jupiter supplies `priceBlockId`, PowerChain compares it with the current RPC slot.

```text
blockLag = currentSlot - priceBlockId
```

Values above `JUPITER_MAX_BLOCK_LAG` degrade the response.

## Decimal mismatch

If Jupiter reports decimals that differ from RPC `getTokenSupply`, the market response degrades. RPC remains authoritative.

## Primary-provider selection

The first available observation in configured priority order becomes the selected provider. The response still includes every valid observation so clients can show provenance and divergence.

## No-price behavior

If no acceptable observation exists:

```text
503 MARKET_DATA_UNAVAILABLE
```

The service never returns `priceUsd: 0` to represent provider failure.
