# Solana Runtime

## RPC authority

PowerChain treats Solana RPC as authoritative for chain state and token-supply inspection.

Core methods used by the overview/runtime include:

```text
getHealth
getSlot
getBlockHeight
getEpochInfo
getVersion
getLatestBlockhash
getGenesisHash
getSupply
getTokenSupply
getAccountInfo
getMultipleAccounts
```

## RPC selection

The runtime resolves RPC from configured sources. Production is expected to use explicit private RPC/Helius infrastructure. Public cluster RPC is development-only when `ALLOW_DEV_FALLBACK=true`.

## Cluster verification

`SOLANA_EXPECTED_GENESIS_HASH` binds a deployment to the intended cluster.

`/api/v1/ready` evaluates:

1. current slot/block-height/blockhash availability;
2. genesis mismatch;
3. overall Solana overview state.

A mismatch causes readiness failure.

## Latest blockhash

The overview exposes both:

- `blockhash`
- `lastValidBlockHeight`

These values are operational telemetry, not reusable transaction authorization tokens. Transaction-building code should fetch a fresh blockhash at prepare/sign time.

## Cache and request coalescing

The Solana service uses short TTL caches and in-flight coalescing to avoid upstream stampedes when multiple UI/API requests ask for the same key simultaneously.

Typical intent:

- overview: short-lived cluster snapshot;
- market: ~15s market snapshot;
- asset: ~30s mint/metadata snapshot.

`/api/v1/providers/status` exposes cache entry count and in-flight request count without leaking keys or URLs.

## Production rule

An RPC timeout, missing account or provider failure must propagate as unavailable/degraded state. The service must not synthesize slot, balance, token supply or transaction confirmation values.
