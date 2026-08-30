# Integration Guide — PowerChain Crisis v1.0.0

This package is a **production-hardening overlay**. Apply it to the canonical monorepo rather than treating it as a standalone replacement application.

## Merge targets

| Overlay path | Canonical target |
| --- | --- |
| `config/economics.json` | shared product/economic configuration |
| `config/route-status.json` | cross-chain/deployment status registry |
| `packages/policy` | policy / safe-action binding package |
| `packages/fees` | payment / fee quote package |
| `packages/utility` | PWRC utility service |
| `packages/bridge` | cross-chain route/reconciliation service |
| `packages/token-factory` | Token-2022 factory policy package |
| `packages/rewards` | community reward policy package |
| `shared/ui/logo.tsx` | canonical shared logo component |
| `components/flow-charts.tsx` | web/docs architecture UI component library |
| `public/images/architectures` | `apps/web/public/images/architectures` |
| `public/icons` | web/dashboard/docs PWA icon targets |
| `public/docs/whitepaper.pdf` | `apps/web/public/docs/whitepaper.pdf` |
| `docs/*` | canonical `/docs` plus `apps/docs` content |

## Integration order

1. Merge configuration and types first.
2. Wire fee and policy packages into server-created quotes; clients must not choose fee schedules or destinations.
3. Wire PWRC utility consumption into a separate utility ledger/reservation lifecycle.
4. Wire successful-funding commission only after the capital-pool authoritative success predicate is true.
5. Create one signer transaction for the 2% + 3% commission legs where the asset/network supports atomic execution; reconcile both legs before `CONFIRMED`.
6. Integrate cross-chain routes as provider-specific adapters with route version, replay domain and deployment status.
7. Keep CCIP and wPWRC/Sui disabled until deployment/audit gates pass.
8. Integrate token factory behind verified issuer and organization policy; never send mint private keys to the backend.
9. Add reward recommendations only after evidence verification and cumulative anti-gaming checks.
10. Install UI/logo/icons/architecture assets and public whitepaper.
11. Run the canonical monorepo build, Prisma migrations, Anchor/Sui tests, security tests and production configuration gates.

## Compatibility rule

Do not overwrite canonical PWRC mint address, fixed supply, transfer-fee extension, revoked authorities or other mainnet token facts with values from this overlay. Deployment/token facts must come from the canonical verified registry.
