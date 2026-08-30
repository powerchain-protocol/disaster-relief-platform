# Cross-chain Security and Routing

Supported provider types in the domain model:

```text
CCTP_V2
CCIP
POWERCHAIN_WPWRC
```

A route is executable only when:

- route status is `LIVE`;
- route is audited;
- route ID/version match;
- replay domain matches;
- transfer ID is valid and unused;
- asset/source/destination chain match;
- amount is positive and within cap;
- source/destination addresses are present.

## Replay protection

Every transfer binds:

```text
routeId
routeVersion
replayDomain
transferId
```

Previously seen transfer IDs are rejected.

## Wrapped-supply conservation

For wrapped PWRC or another wrapped asset:

```text
projected outstanding = outstanding + pending mint
projected outstanding <= verified backing
```

An optional route cap can further restrict outstanding supply.

## Status semantics

- `LIVE`: route may execute if all checks pass.
- `DEGRADED`: non-normal condition; execution should be policy-reviewed.
- `DISABLED`: no execution.
- `TBA`: architecture/roadmap only.
- `UNAVAILABLE`: provider/runtime unavailable.

## CCTP / CCIP / wPWRC

These are not interchangeable bridge implementations. Each has distinct finality, custody and attestation assumptions.

The repository must not label a route live merely because an adapter exists in source code.
