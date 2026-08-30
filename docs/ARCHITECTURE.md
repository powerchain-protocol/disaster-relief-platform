# PowerChain Relief Architecture

**Version:** 1.0.0  
**Status:** implementation baseline

## System objective

PowerChain Relief is verified capital infrastructure for emergency response. Its architecture deliberately separates five forms of truth:

1. **Operational truth** — organizations, incidents, capital state, approvals, evidence and ledger records.
2. **Policy truth** — deterministic rules defining who may do what and under which evidence/approval conditions.
3. **Settlement truth** — Solana transaction, program and token state.
4. **Market intelligence** — provider-derived prices and liquidity observations.
5. **Verified impact** — evidence-backed outcomes after delivery.

## Runtime topology

```text
Public Website / Dashboard
          │
          ▼
      Next.js Web
          │ same-origin API
          ▼
      Fastify Backend
          │
  ┌───────┼─────────┐
  ▼       ▼         ▼
Postgres Solana RPC Providers
  │       │         │
Capital   │       Pyth
Policy    │       Jupiter
Evidence  │       Birdeye
Ledger    │       CoinGecko
          │       Helius DAS
          ▼
Programs · Balances · Supply · Settlement
```

## Execution model

```text
Observe
  ↓
Analyze
  ↓
Policy evaluation
  ↓
Evidence review
  ↓
Human approval
  ↓
Signer authorization
  ↓
Prepare
  ↓
Submit
  ↓
Confirm / EXECUTION_UNKNOWN
  ↓
Reconcile
  ↓
Ledger + receipt
```

No UI component, wallet balance, token holding or AI recommendation can bypass this chain.

## Source-of-truth rules

- Postgres is operational truth.
- Solana is settlement truth.
- provider market data is analytics-only.
- Helius DAS enriches indexing but does not replace RPC authority.
- large/sensitive evidence remains off-chain with content hashes and verification metadata.


## Program assurance

Program identity is deployment-driven. Required programs must be configured and independently verified through RPC before strict readiness passes.

See `docs/PROGRAMS.md` and `programs/registry.json`.
