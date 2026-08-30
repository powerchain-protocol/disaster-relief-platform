# API Fallback Policy

Fallback is resilience, not authority.

- **RPC:** bounded failover across configured RPC endpoints; cluster/genesis policy still applies.
- **Market:** configured provider priority may fall through Pyth, Jupiter, CoinGecko, CoinMarketCap, Birdeye, and Helius enrichment. RPC supply/decimals remain authoritative.
- **Programs:** no fallback program ID. Required IDs/fingerprints must verify on-chain.
- **Compatibility:** aliases call canonical services and do not implement separate business logic.
- **Unavailable:** never invent price, balance, supply, transaction, deployment, or provider state; never substitute demo data in live mode.
