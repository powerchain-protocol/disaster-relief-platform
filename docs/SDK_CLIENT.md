# API Client SDK

Package:

```text
@powerchain/crisis-api-client
```

## Instantiate

Same-origin browser usage:

```ts
import { PowerChainApiClient } from "@powerchain/crisis-api-client";

const api = new PowerChainApiClient("");
```

Direct backend server usage:

```ts
const api = new PowerChainApiClient("http://localhost:4000");
```

## Methods

```ts
api.health()
api.ready()
api.publicConfig()
api.providerStatus()
api.solanaOverview()
api.solanaPrograms()
api.solanaMarket(mint)
api.solanaAsset(mint)
```

Compatibility methods:

```ts
api.compatibilityOverview()
api.compatibilityTokenMarket(mint?)
api.compatibilityAsset(mint)
```

Prefer canonical methods for new code.

## Error handling

The client throws `PowerChainApiError` with:

```ts
status
code
message
details
```

Example:

```ts
try {
  const market = await api.solanaMarket(mint);
} catch (error) {
  if (error instanceof PowerChainApiError) {
    console.error(error.status, error.code, error.message);
  }
}
```

## Cache semantics

The client uses `cache: "no-store"` for GET requests. Server/provider caching is controlled by the backend service layer, not the browser.
