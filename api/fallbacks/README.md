# Fallback and Degradation Policy

Fallback exists to preserve availability without weakening truth.

| Domain | Allowed degradation | Forbidden behavior |
| --- | --- | --- |
| Solana RPC | bounded configured endpoint failover | silently switching network/genesis |
| Helius | omit DAS enrichment | invent wallet assets |
| Pyth/Jupiter/Birdeye/CoinGecko | provider priority/fallback | overwrite authoritative supply or balances |
| Program registry | show unconfigured/not found | substitute another program ID |
| WebSocket | reconnect with capped backoff | infer chain failure from socket loss |
| Dashboard | stale/degraded/unavailable state | fill cards with fake zeroes |
| Settlement | re-observe/reconcile | resubmit `EXECUTION_UNKNOWN` as a new payment |

## Freshness

Every provider-backed observation should expose or preserve a freshness signal. A technically successful HTTP request can still be operationally degraded if its source is stale, divergent or below quorum.

## Release safety

Release and deployment gates must use raw readiness/quorum state, not presentation hysteresis.
