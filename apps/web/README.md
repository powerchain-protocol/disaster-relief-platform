# PowerChain Crisis Web

Next.js 16.3 / React 19 website, same-origin API gateway, and Solana operations console.

## Request boundary

The browser calls `/api/*` on the website origin. Server-only Next.js handlers forward requests to Fastify through `POWERCHAIN_API_URL`. RPC URLs, Helius/Pyth/Jupiter/CoinGecko/CoinMarketCap/Birdeye credentials, and internal backend tokens stay server-side.

## Solana console

`/solana` presents cluster state, required program verification and executable fingerprints, SPL vs Token-2022 inspection, on-chain supply/decimals and authorities, source-aware market data, provider freshness/quorum, and SLO/degraded-state diagnostics.

Unavailable or stale upstream data is rendered explicitly; the UI never converts it to zero.

## Security

Never add provider credentials or custom RPC endpoints to `NEXT_PUBLIC_*`. Browser-bundle secret scanning is a release gate.

See `../../docs/WEB_PROXY.md`, `../../docs/CHARTS_DATA_PROVENANCE_FULL.md`, and `../../docs/SECURITY.md`.

## Light theme

The website and Solana operations console are light-first by default: white primary surfaces, light-gray canvas/secondary surfaces, dark-green primary buttons, and restrained borders.

## Theme system

- Default: `light`
- Optional: `dark`
- Preference key: `powerchain-theme`
- Light logo: `/brand/logo-green.png`
- Dark logo: `/brand/logo-white.png`
- Light app icon: `/brand/app-icon-light.png`
- Dark app icon: `/brand/app-icon-dark.png`

The theme toggle persists explicitly selected theme in local storage. Absence of a saved preference always resolves to light; operating-system dark mode does not silently override the product default.
