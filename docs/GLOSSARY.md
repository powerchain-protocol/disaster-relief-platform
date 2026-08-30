# Glossary

**Canonical route** - The supported `/api/v1/...` route whose contract new clients should target.

**Compatibility alias** - A shorter/older URL calling the same implementation as the canonical route and emitting deprecation metadata.

**DataState** - `LIVE`, `DEGRADED`, `UNAVAILABLE`, or `UNCONFIGURED`.

**Deployment verification** - Reading a configured program account from Solana and verifying executable state/loader rather than trusting configuration alone.

**Genesis binding** - Comparing active RPC genesis hash with `SOLANA_EXPECTED_GENESIS_HASH`.

**Helius DAS** - Optional asset/metadata enrichment provider. Not authoritative for token supply in this architecture.

**Jupiter block lag** - Difference between current RPC slot and Jupiter price `blockId` when available.

**Market observation** - One provider-specific price/liquidity/volume/market-cap observation with source metadata.

**Power Units** - Internal PWRC utility metering abstraction.

**PWRC** - PowerChain network utility asset; not crisis-capital authority.

**RPC authority** - Rule that Solana RPC is authoritative for chain state and mint supply/decimals.

**Token-2022** - Solana token program supporting extensions beyond classic SPL Token behavior.

**Provider divergence** - Basis-point spread between minimum and maximum valid market price observations.

**Readiness** - Whether authoritative chain state is usable and cluster binding is acceptable.

**EXECUTION_UNKNOWN** - State used when transaction outcome cannot yet be established; it must not be treated as success or failure until reconciled.

**Successful-funding commission** - 5% post-success proceeds rule: 2 percentage points Community Treasury + 3 percentage points Ecosystem & Development, separate from contributor checkout.
