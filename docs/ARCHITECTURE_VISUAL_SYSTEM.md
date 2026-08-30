# Architecture Visual System v1.0.0

PowerChain Crisis uses one diagram language across public web, dashboard, docs and whitepaper assets.

## Connector grammar

- Badges are card-owned and must remain within the node bounds.
- Shared branch rails are plain connector rails; arrowheads appear only on destination segments.
- Lines terminate on card edges and route through whitespace, never across text or badges.

| Meaning | Treatment |
| --- | --- |
| Required authoritative transition | solid 2-2.5 px line + arrowhead |
| Optional/provider-specific path | dashed line + arrowhead |
| Capital movement | blue semantic connector |
| Utility/service movement | forest-green connector |
| Verified/trusted transition | success-green connector |
| Review/warning transition | amber connector |
| Informational/non-authoritative signal | muted or dashed connector |

Architecture lines should use orthogonal/elbow routing when multiple branches exist. Avoid line crossings where a branch can be routed through a shared rail.

## Data-bearing charts

Every data-bearing chart should expose:

- `mode`: LIVE / DEMO / STATIC / DEGRADED / TBA / UNAVAILABLE;
- `source` identity;
- update timestamp when live;
- stale/degraded state;
- unit and axis labels;
- accessible text equivalent.

`LIVE` without a source is invalid. Mainnet must never silently substitute demo values.

## Demo fixture

The canonical public product fixture remains **Nepal Flood Response - DEMO ONLY**:

- Raised: $4.28M
- Allocated: $3.71M
- Escrow: $770K
- Verified Impact: $2.94M

These values are design/test fixtures and must never be represented as real humanitarian totals.


## Badge and connector fit invariants

- Status badges belong to the node card and must remain within its bounds with internal padding.
- If a badge is present, title/subtitle baselines move below the badge rail; badge text is shortened before card overflow.
- Shared branch rails do not carry arrowheads. Only the final destination segment uses an arrowhead.
- Connector paths terminate at card boundaries and route through whitespace instead of crossing titles, subtitles or badges.
- The reusable SVG component clips text/badges to the card interior as a final overflow guard.
