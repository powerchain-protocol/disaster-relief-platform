# UI/UX Improvements — v1.0.0

PowerChain Crisis should expose **operational truth before blockchain detail**.

## Funding review

Before wallet/card authorization, the review surface shows five separate amounts when applicable:

1. crisis principal;
2. PowerChain transaction/service fee;
3. successful-funding commission policy status (not charged as a hidden per-transaction fee);
4. estimated Solana network fee;
5. external provider/onramp fee.

The UI must never collapse these into an ambiguous `Total fees` line without drill-down. Quotes bind the fee schedule version, policy version, network, asset, purpose and destination.

## Provider status

Every external provider card uses explicit state + source text:

- `LIVE` — verified at runtime;
- `DEGRADED` — partial/fallback path;
- `DISABLED` — configured off;
- `TBA` — architecture/planned only;
- `UNAVAILABLE` — expected provider cannot be reached or verified.

A static config file cannot justify a `LIVE` badge.

## Mainnet data

Mainnet surfaces must not show fixture balances, prices, signatures, settlement status, risk evidence or verification claims. If authoritative data is missing, render an `Unavailable` or `Degraded` state with source/freshness metadata.

## Mobile

Mobile prioritizes:

`Understand crisis → Trust status → Fund → Track capital → Impact`

Operator-only controls move behind role-aware navigation. Critical actions use sticky review/action bars, 44px+ touch targets, explicit pending states and no color-only semantics.

## Transaction state

`Preparing → Awaiting signature → Submitted → Confirming → Reconciled`

`EXECUTION_UNKNOWN` is a first-class state. The UI must never turn an unknown RPC/provider result into success.

## Chart and architecture connector system

The visual system now uses one connector grammar across dashboards, marketing, docs and whitepaper figures:

- 2 px default connector lines and 2.5 px emphasized paths;
- explicit arrowheads rather than bare lines;
- orthogonal/elbow routing for architecture diagrams to reduce line crossings;
- dashed lines only for optional, advisory, planned or non-authoritative paths;
- edge labels such as `AUTHORIZE`, `AFTER POOL SUCCESS`, `APPROVED ROUTE` and `RECONCILE`;
- semantic line states for capital, utility, trust, warning and risk;
- vertical connector layout below the mobile breakpoint;
- source/status metadata on data-bearing charts (`LIVE`, `DEMO`, `STATIC`, `DEGRADED`, `TBA`, `UNAVAILABLE`).

Mainnet charts must never substitute fixture values when authoritative data is unavailable. Use an explicit unavailable/degraded presentation instead.
