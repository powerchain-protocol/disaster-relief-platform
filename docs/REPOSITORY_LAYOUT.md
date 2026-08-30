# Repository Layout

PowerChain Crisis uses one backend and one API root.

```text
apps/
  backend/
  web/
api/
  openapi/
  endpoints/
  fallbacks/
  swagger/
  postman/
programs/
packages/
docs/
```

Invariants: no root `backend/`, no root `postman/`, no root OpenAPI YAML; `apps/backend` is the only backend; `api/` owns all API contract and developer assets.
