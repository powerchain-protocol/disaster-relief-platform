# API Endpoints

`routes.json` is the canonical route registry.

## Canonical

```text
/api/v1/health
/api/v1/ready
/api/v1/config/public
/api/v1/providers/status
/api/v1/observability/slo
/api/v1/openapi.json
/api/v1/solana/overview
/api/v1/solana/programs
/api/v1/solana/market?mint=<address>
/api/v1/solana/assets/:mint
```

## Compatibility

```text
/api/solana/overview
/api/token/market?mint=<address>
/api/assets/:mint
```

Aliases use the canonical services. `/api/v1/solana/market` always requires `mint`; only `/api/token/market` may use server `PWRC_MINT`.
