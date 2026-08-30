# Charts & Architecture Visual Grammar v1.0.0

PowerChain charts and architecture diagrams use one semantic system across public web, dashboard, docs, exported SVGs and whitepaper figures.

## Connector rules

- Badges must remain inside their parent card with at least 12 px internal padding; long badge text is shortened before it can overflow.
- Connectors terminate at the card boundary. Shared branch rails do not receive arrowheads; only the final segment entering a destination does.
- Connector rails route through the whitespace between cards and must never cross node text or status badges.

- Process and architecture connectors terminate in a visible arrowhead.
- Edge state is independent from node state. A warning release edge can leave a neutral node; a verified edge can enter a trust node.
- Branches use orthogonal routing. Avoid diagonal spaghetti lines.
- Optional or planned routes use dashed edges plus a visible status such as `TBA`, `DISABLED` or `DEGRADED`.
- Edge labels describe the transition: `authorize`, `submit`, `confirm`, `policy`, `release`, `evidence`, `reconcile`.
- Mobile process flows become vertical rather than compressing text into tiny horizontal nodes.

## Semantic lines

| Meaning | Semantic state |
| --- | --- |
| Financial capital | `capital` |
| PWRC / platform utility | `utility` |
| Verified / reconciled | `trust` |
| High-risk / blocked | `risk` |
| Pending / stale / attention | `warning` |
| Structural / informational | `neutral` |

Color is never the only signal. Labels, status text, dash style and accessible descriptions remain present.

## Data-source contract

Every operational chart uses `ChartSourceMeta` with:

- mode: `LIVE`, `DEMO`, `STATIC`, `DEGRADED`, `TBA` or `UNAVAILABLE`;
- human-readable source;
- optional stable source ID;
- observed/update timestamps where applicable;
- freshness threshold and explicit stale state;
- optional explanatory note.

A production mainnet chart may not display fixture values as live data. If the authoritative source is unavailable, render `DEGRADED` or `UNAVAILABLE` instead of a synthetic zero or demo fallback.

## Line charts

Line charts expose:

- latest value per series;
- previous-point percentage change;
- verified / estimated / stale point quality;
- source/freshness footer;
- semantic line state;
- accessible hidden data table;
- explicit empty/unavailable state.

Avoid decorative smoothing when it could imply measurements that were never observed. Straight segments preserve the actual sampled points.

## Static architecture exports

`public/images/architectures/*.svg` are generated assets and must include:

- accessible `<title>` and `<desc>`;
- arrow markers;
- labeled transitions;
- deployment/data status where relevant;
- source/version footer;
- no gradients.

Regenerate with:

```bash
python scripts/build-architecture-svgs.py
```

## Solana token market-data diagram

`public/images/architectures/solana-market-data.svg` uses the same connector grammar and makes data authority explicit:

```text
Solana RPC / getTokenSupply
  -> on-chain supply + decimals

Jupiter Price API V3
  -> USD price + 24h change + blockId + reported decimals

Jupiter Tokens V2
  -> liquidity enrichment when available
```

Liquidity is optional enrichment and is rendered as unavailable/null when Jupiter does not provide it; charts must not turn missing liquidity into `$0`.


## Badge and connector fit invariants

- Status badges belong to the node card and must remain within its bounds with internal padding.
- If a badge is present, title/subtitle baselines move below the badge rail; badge text is shortened before card overflow.
- Shared branch rails do not carry arrowheads. Only the final destination segment uses an arrowhead.
- Connector paths terminate at card boundaries and route through whitespace instead of crossing titles, subtitles or badges.
- The reusable SVG component clips text/badges to the card interior as a final overflow guard.
