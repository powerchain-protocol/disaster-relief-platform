# Route Policy

- `/api/v1/*` is canonical.
- Compatibility aliases call the same implementation.
- `/api/v1/solana/market` always requires `mint`.
- `/api/token/market` alone may default to backend `PWRC_MINT`.
- Provider credentials and private RPC configuration are server-only.
