# Provider Operations and Telemetry

## Endpoint

```text
GET /api/v1/providers/status
```

The endpoint is designed for operators, not secret discovery.

## Returned telemetry

For each provider:

- provider name
- capability
- configured boolean
- state (`LIVE`, `DEGRADED`, `UNCONFIGURED`, `UNKNOWN`)
- last checked timestamp
- last latency
- consecutive failures
- redacted last error code

It also reports cache pressure:

```json
{
  "cache": {
    "entries": 12,
    "inFlight": 1
  }
}
```

## What is intentionally absent

The endpoint never returns:

- RPC URLs
- API keys
- auth headers
- internal tokens
- provider secrets

## Operational interpretation

| State | Suggested operator action |
| --- | --- |
| `LIVE` | Normal operation |
| `DEGRADED` | Investigate latency/failures; keep user-facing provenance visible |
| `UNCONFIGURED` | Expected only if provider is optional |
| `UNKNOWN` | Provider has not yet produced a telemetry sample |

## Provider failover

Market failover is priority-based; RPC failover follows backend configuration. Provider failure should not cause client-side secret use or direct browser calls to private APIs.

## Cache stampede protection

The service coalesces concurrent requests for the same cache key. A single upstream request populates the cache while concurrent callers await the same promise.

This is important for overview/market refresh bursts from multiple dashboard sessions.
