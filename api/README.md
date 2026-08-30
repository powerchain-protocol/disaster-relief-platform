# PowerChain Disaster Relief API

All API contract and developer assets live here.

```text
api/
├── openapi/powerchain-disaster-relief.yaml
├── endpoints/routes.json
├── fallbacks/README.md
├── swagger/
└── postman/
```

Sources of truth: runtime `apps/backend`; OpenAPI `api/openapi/powerchain-disaster-relief.yaml`; route registry `api/endpoints/routes.json`; fallback policy `api/fallbacks/README.md`; runtime Swagger `/api/swagger`; runtime OpenAPI `/api/v1/openapi.json`.

## Wallet data

`GET /api/v1/wallet/:address/portfolio` returns RPC-native SOL balance plus Helius DAS wallet assets when Helius is configured. Wallet connection does not authenticate an operator or authorize treasury actions.

## Capital domain

See `endpoints/capital-domain.md` for deterministic capital transitions, release policy evaluation, evidence/approval gates, idempotency and immutable receipt hashing.
