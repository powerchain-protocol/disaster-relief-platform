# Postman

Canonical Postman assets:

```text
api/postman/PowerChain-Disaster-Relief.postman_collection.json
api/postman/PowerChain-Disaster-Relief.local.postman_environment.json
```

The collection covers health, readiness, provider telemetry, SLO state, OpenAPI, Solana overview, required programs, market resolution, mint inspection, and compatibility aliases.

## Local variables

```text
baseUrl = http://localhost:4000
mint    = <SOLANA_MINT>
```

For website-origin proxy verification, duplicate the environment and set `baseUrl` to the web origin. Never store provider keys, private RPC URLs, or production internal tokens in a shared Postman artifact.
