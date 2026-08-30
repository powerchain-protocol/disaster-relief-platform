# Solana WebSocket

**Endpoint:** `WS /api/v1/ws/solana`

This channel is read-only and intended for operator freshness, not transaction execution.

## Server hello

```json
{
  "type": "hello",
  "version": "1.0.0",
  "topics": ["overview", "programs"],
  "intervalSeconds": 30
}
```

## Subscribe

```json
{
  "type": "subscribe",
  "topics": ["overview", "programs"]
}
```

## Operational limits

- maximum transport payload: 8 KiB;
- application inbound ceiling: 4 KiB;
- maximum 30 client messages per connection;
- snapshot interval: 30 seconds;
- supported topics: `overview`, `programs`;
- explicit error frames;
- reconnect with capped exponential backoff.

## Semantics

A disconnected WebSocket is not proof of provider, RPC or Solana failure. `/api/v1/ready`, `/api/v1/providers/status` and canonical REST resources remain authoritative for runtime state.
