# Endpoint Reference

## System

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/v1/health` | Process liveness and non-secret runtime snapshot |
| GET | `/api/v1/ready` | Strict deployment/runtime readiness gate |
| GET | `/api/v1/config/public` | Public capability configuration |
| GET | `/api/v1/providers/status` | Redacted provider and quorum state |
| GET | `/api/v1/observability/slo` | Rolling availability and latency window |
| GET | `/api/v1/openapi.json` | Canonical OpenAPI document |
| WS | `/api/v1/ws/solana` | Read-only Solana/program snapshot stream |

`health` answers “is the process alive?”  
`ready` answers “is this deployment allowed to serve production work?”

## Solana

| Method | Route | Authority |
| --- | --- | --- |
| GET | `/api/v1/solana/overview` | RPC |
| GET | `/api/v1/solana/programs` | RPC + configured deployment policy |
| GET | `/api/v1/solana/market?mint=<address>` | Source-labelled market providers |
| GET | `/api/v1/solana/assets/:mint` | RPC, optional metadata enrichment |

Program verification may inspect executable state, recognized loader, ProgramData, deploy slot, upgrade authority and executable fingerprint.

## Wallet

`GET /api/v1/wallet/:address/portfolio`

Native SOL is read from RPC. Indexed SPL/Token-2022 assets may be enriched by Helius DAS. Wallet connection is not operator authentication and never grants treasury authority.

## Capital and settlement

See `capital-domain.md`.

The capital API separates:
`raised → available → allocated → escrowed → release-ready → released → spent → delivered → verified impact`.

Settlement separates:
`prepared → submitted → confirming → reconciled`, with `EXECUTION_UNKNOWN` as an explicit uncertainty state.
