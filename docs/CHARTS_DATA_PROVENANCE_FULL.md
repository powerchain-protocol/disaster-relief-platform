# Charts, Architecture and Data Provenance

## Data modes

```text
LIVE
DEMO
STATIC
DEGRADED
TBA
UNAVAILABLE
```

A chart marked `LIVE` must have a source. If no source exists, presentation falls back to `UNAVAILABLE`.

A stale live series becomes `DEGRADED` and remains visibly labeled.

## No fake zeros

A missing provider value is not rendered as zero. `UNAVAILABLE`/`TBA` should suppress quantitative rendering where appropriate.

## Capital sanity

The shared chart helper can validate monotonic relationships:

```text
allocated <= raised
released <= allocated
verified <= released (or allocated when release stage is omitted)
```

This is a visualization sanity check, not the authoritative accounting engine.

## Architecture graphics

The public architecture assets use:

- orthogonal connectors;
- explicit arrowheads;
- semantic edge labels;
- status badges;
- source/deployment notes;
- dashed connectors for optional/degraded/TBA paths;
- white text on dark forest-green cards.

## Source-of-truth rule

Any live chart should expose enough metadata for an operator to answer:

- where did this value come from?
- when was it observed?
- is it stale?
- is it live/demo/degraded?
- is it an authoritative value or a derived/market observation?
