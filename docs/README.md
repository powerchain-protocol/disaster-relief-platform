# PowerChain Crisis Documentation

**Version:** 1.0.0
**Product:** PowerChain Crisis — Crisis Capital Network
**Primary settlement:** Solana
**Runtime:** Fastify API + Next.js web + typed API client

This directory is the canonical engineering and operations documentation for the v1.0.0 workspace. It distinguishes implemented behavior from deployment-specific configuration and evidence.

> **Truth rule:** live/mainnet claims require authoritative runtime evidence. Missing, stale, or unverified data is `DEGRADED`, `UNAVAILABLE`, or blocked—not silently replaced.

## Engineering and operations

| Area | Document |
| --- | --- |
| Setup | [Quick Start](QUICKSTART.md) |
| Architecture | [System Architecture](ARCHITECTURE.md) |
| Repository layout | [Repository Layout](REPOSITORY_LAYOUT.md) |
| HTTP/API | [API Reference](API_REFERENCE.md) |
| Configuration | [Environment Reference](ENVIRONMENT_REFERENCE.md) |
| Solana | [Solana Runtime](SOLANA_RUNTIME.md) |
| Programs | [Program Verification](PROGRAM_VERIFICATION.md) |
| Tokens | [Token Inspection](TOKEN_INSPECTION.md) |
| Markets | [Market Data](MARKET_DATA.md) |
| Providers | [Provider Operations](PROVIDER_OPERATIONS.md) |
| Observability | [Observability & SLOs](OBSERVABILITY_SLOS.md) |
| Web gateway | [Next.js Proxy](WEB_PROXY.md) |
| Realtime | [WebSockets](WEBSOCKETS.md) |
| Security | [Security Model](SECURITY.md) |
| Deployment | [Production Deployment](PRODUCTION_DEPLOYMENT.md) |
| Operations | [Operations Runbook](OPERATIONS_RUNBOOK.md) |
| Release | [Release Acceptance](RELEASE_ACCEPTANCE.md) |
| Evidence | [Deployment Evidence](DEPLOYMENT_EVIDENCE.md) |
| Rollback | [Production Rollback](ROLLBACK.md) |
| Troubleshooting | [Troubleshooting](TROUBLESHOOTING.md) |
| Testing | [Testing & Validation](TESTING_VALIDATION.md) |

## Protocol and product domains

| Domain | Document |
| --- | --- |
| PWRC | [PWRC Utility](PWRC_UTILITY.md) |
| Fees | [Fees & Economics](FEES_ECONOMICS.md) |
| Cross-chain | [Cross-chain](CROSS_CHAIN.md) |
| Token issuance | [Token Factory](TOKEN_FACTORY.md) |
| Rewards | [Community Rewards](COMMUNITY_REWARDS_FULL.md) |
| Data/visual truth | [Charts & Data Provenance](CHARTS_DATA_PROVENANCE_FULL.md) |
| SDK | [API Client](SDK_CLIENT.md) |
| Postman | [Postman](POSTMAN.md) |
| Terminology | [Glossary](GLOSSARY.md) |
| Contributions | [Contributing](CONTRIBUTING.md) |

## Invariants

1. RPC `getTokenSupply` is authoritative for mint supply and decimals.
2. Market providers cannot overwrite on-chain supply truth.
3. `/api/v1/solana/market` requires an explicit mint.
4. Only `/api/token/market` may default to backend `PWRC_MINT`.
5. Compatibility routes share the canonical service implementation.
6. RPC/provider credentials remain server-side.
7. PWRC balance never grants treasury authority.
8. AI output, webhooks, and browser state do not prove settlement.
9. Required production bindings fail closed when missing or mismatched.
10. Unavailable data is never represented as a plausible zero.

## Release hardening

[Release Hardening II](RELEASE_HARDENING_V2.md) documents RPC failover/circuit state, provider freshness/quorum hysteresis, rolling SLO/error-budget evaluation, program executable fingerprints/change control, post-deploy canaries, SBOM/provenance, rollback evidence, and Ed25519 deployment attestation.

## Handbook

- [Full Documentation PDF](handbook/PowerChain-Crisis-Full-Documentation-v1.0.0.pdf)
- [Editable DOCX](handbook/PowerChain-Crisis-Full-Documentation-v1.0.0.docx)

The code-adjacent Markdown in this directory remains canonical when handbook prose and implementation details differ.
