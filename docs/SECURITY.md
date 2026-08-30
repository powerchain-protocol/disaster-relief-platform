# Security Model

## Principles

- provider credentials are backend-only;
- mainnet is fail-closed;
- token balance is not authorization;
- compatibility aliases cannot bypass canonical validation;
- user-visible market data is source-aware;
- settlement confirmation must come from authoritative chain reconciliation;
- unknown execution remains unknown.

## Backend-origin authentication

If `POWERCHAIN_INTERNAL_API_TOKEN` is set, the backend protects:

```text
/api/v1/solana/*
/api/solana/*
/api/token/*
/api/assets/*
```

The token comparison uses constant-time `timingSafeEqual` with equal-length buffers.

Production requires at least 32 characters.

## CORS

CORS is disabled when no origin list is configured. Production requires explicit origins and rejects `*`.

Allowed methods are intentionally read-oriented:

```text
GET
HEAD
OPTIONS
```

## HTTP controls

- Helmet
- 1 MiB body limit
- global per-minute rate limit
- request IDs
- authorization/internal-token log redaction
- no-store for API responses
- `X-Content-Type-Options: nosniff`
- strict referrer policy

## Website headers

The web runtime also uses defensive browser headers such as CSP, COOP/CORP, HSTS, Permissions Policy and clickjacking/content-type protections.

## Secret handling

Logs redact:

```text
Authorization
x-powerchain-internal-token
```

Provider status never returns secret values.

## PWRC authority boundary

```text
PWRC -> utility
Identity -> actor
Role -> scope
Policy -> allowed action
Approval -> authorization
Signer -> cryptographic execution
```

`assertNoUtilityTreasuryAuthority()` always reports that PWRC balance alone cannot authorize financial actions.

## Action binding

Sensitive financial actions should bind:

- quote ID/hash
- fee quote hash
- policy version
- fee-schedule version
- deployment ID
- actor / organization / resource
- network / program
- asset / amount / purpose / destination
- expiry
- idempotency key

Quote expiry is bounded to 15 minutes by the shared policy helper.
