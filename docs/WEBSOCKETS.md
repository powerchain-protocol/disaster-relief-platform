# Solana WebSocket Snapshot Protocol

## Endpoint

```text
WS /api/v1/ws/solana
```

This is a bounded snapshot stream, not a raw RPC passthrough.

## Initial message

The server sends:

```json
{
  "type": "hello",
  "version": "1.0.0",
  "topics": ["overview", "programs"],
  "intervalSeconds": 30
}
```

It then publishes an immediate snapshot.

## Subscription message

```json
{
  "type": "subscribe",
  "topics": ["overview", "programs"]
}
```

Unknown topics are filtered out. If no valid topic remains, `overview` is restored as the default.

## Snapshot

```json
{
  "type": "snapshot",
  "timestamp": "...",
  "overview": { "...": "..." },
  "programs": { "...": "..." }
}
```

## Policy limits

- maximum WebSocket payload: 8 KiB;
- application message limit: 30 messages per connection;
- incoming message size check: 4096 bytes;
- invalid JSON and invalid message shapes return explicit error messages;
- message-limit violation closes with policy code `1008`.

## Authority boundary

The stream is operational telemetry only. It must not be used as authoritative proof of a transaction, treasury release, balance change or verified impact.
