import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const root = resolve(new URL("..", import.meta.url).pathname);
const required = [
  "docs/IMPROVEMENTS_V1.0.0.md","docs/PROVIDER_OBSERVABILITY.md","docs/CHARTS_AND_ARCHITECTURE.md","docs/FEE_MODEL.md","docs/CROSS_CHAIN_SECURITY.md","docs/TOKEN_FACTORY_SECURITY.md",
  "docs/COMMUNITY_REWARDS.md","docs/DEPLOYMENT_STATUS.md","docs/SECURITY_MODEL.md","docs/ROADMAP.md","docs/UX_IMPROVEMENTS.md","docs/OBSERVABILITY_SLOS.md","docs/WHITEPAPER.md","docs/INTEGRATION_GUIDE.md",
  "docs/whitepaper/PowerChain-Crisis-Capital-Network-Whitepaper-v1.0.0.docx","public/docs/whitepaper.pdf",
  "packages/policy/src/index.ts","packages/fees/src/index.ts","packages/utility/src/index.ts","packages/bridge/src/index.ts","packages/token-factory/src/index.ts","packages/rewards/src/index.ts",
  "shared/ui/logo.tsx","components/architecture/architecture-map.tsx","components/architecture/architecture-map.css","components/architecture/source-of-truth-map.tsx","components/flow-charts.tsx","components/flow-charts.css","components/charts/line-chart.tsx","components/charts/line-chart.css","components/charts/data-health-strip.tsx","components/charts/data-health-strip.css","types/charts.ts","data/architecture.ts","config/architecture-data.json","packages/charts/src/index.ts","public/images/architectures/pwrc-utility.svg","public/images/architectures/fee-stack.svg",
  "public/images/architectures/cross-chain.svg","public/images/architectures/token-factory.svg","public/images/architectures/community-rewards.svg","public/images/architectures/source-of-truth.svg","public/images/architectures/capital-lifecycle.svg","public/images/architectures/data-provenance.svg","public/images/architectures/solana-market-data.svg",
  "public/icons/favicon.ico","public/icons/apple-touch-icon.png","public/icons/icon-192.png","public/icons/icon-512.png","scripts/build-architecture-svgs.py","tests/charts.mjs",
  "packages/api-contract/src/index.ts","apps/backend/src/services/solana-data.ts","apps/backend/src/api/v1/solana.ts","apps/backend/src/api/legacy-solana.ts","apps/backend/src/api/register.ts","apps/backend/README.md",
  "apps/web/lib/server/powerchain-api-proxy.ts","apps/web/app/api/v1/solana/overview/route.ts","apps/web/app/api/v1/solana/programs/route.ts","apps/web/app/api/v1/solana/market/route.ts","apps/web/app/api/v1/solana/assets/[mint]/route.ts","apps/web/app/api/solana/overview/route.ts","apps/web/app/api/token/market/route.ts","apps/web/app/api/assets/[mint]/route.ts",
  "docs/SOLANA_API.md","config/solana-api.env.example","api/postman/PowerChain-Disaster-Relief.postman_collection.json","api/postman/PowerChain-Disaster-Relief.local.postman_environment.json","api/openapi/powerchain-disaster-relief.yaml","api/swagger/README.md","api/swagger/routes.md","programs/README.md","programs/registry.json","tests/solana-api.mjs","tests/repository-layout.mjs",
  "CHANGELOG.md","MANIFEST.md","VALIDATION_REPORT.md","RELEASE_ACCEPTANCE_STATUS.md",
  "LICENSE","CONTRIBUTORS.md","pnpm-workspace.yaml","docs/BUILD_TOOLCHAIN.md","tests/package-graph.mjs","tsconfig.base.json","docs/FULL_STACK.md","docker-compose.yml",
  "packages/api-client/package.json","packages/api-client/src/index.ts","packages/api-contract/package.json","packages/api-contract/src/index.ts",
  "apps/backend/package.json","apps/backend/src/app.ts","apps/backend/src/server.ts","apps/backend/.env.example","apps/backend/Dockerfile",
  "apps/web/package.json","apps/web/next.config.ts","apps/web/app/layout.tsx","apps/web/app/page.tsx","apps/web/app/solana/page.tsx","apps/web/components/solana-operations-console.tsx","apps/web/hooks/use-polling-resource.ts","apps/web/.env.example","apps/web/Dockerfile",
  "apps/web/app/api/v1/health/route.ts","apps/web/app/api/v1/ready/route.ts","apps/web/app/api/v1/config/public/route.ts","apps/web/app/api/v1/providers/status/route.ts","apps/web/app/api/v1/observability/slo/route.ts","apps/web/app/api/v1/openapi.json/route.ts","apps/web/app/api/openapi.json/route.ts",
  "scripts/check-production.mjs","tests/full-stack.mjs","apps/backend/src/runtime-metrics.ts","tests/slo-runtime.mjs",
  ".nvmrc",".env.production.example",".github/workflows/release-gate.yml",".github/workflows/bootstrap-lockfile.yml",
  "scripts/check-dependency-lock.mjs","scripts/check-browser-secrets.mjs","scripts/check-approvals.mjs","scripts/verify-live-production.mjs","scripts/record-deployment-evidence.mjs","scripts/verify-deployment-evidence.mjs","scripts/release-gate.mjs","scripts/lib/release-integrity.mjs","scripts/generate-sbom.mjs","scripts/generate-release-provenance.mjs","scripts/verify-release-artifacts.mjs","scripts/check-rollback-target.mjs","scripts/check-release-policy.mjs","scripts/check-program-change-control.mjs","scripts/canary-verify.mjs","scripts/sign-deployment-evidence.mjs",
  "tests/release-integration.mjs","tests/release-evidence-runtime.mjs","docs/RELEASE_ACCEPTANCE.md","docs/DEPLOYMENT_EVIDENCE.md","docs/ROLLBACK.md",
  "release/approvals/runbook-rollback.json","release/approvals/runbook-rollback.example.json","release/approvals/program-fingerprint-change.json","release/approvals/program-fingerprint-change.example.json","config/release-policy.json","release/evidence/deployment-evidence.example.json","release/evidence/hermetic-integration-validation.json"
];
for (const file of required) assert.ok(existsSync(resolve(root,file)), `missing ${file}`);
const docs = required.filter(x=>x.endsWith('.md')).map(x=>readFileSync(resolve(root,x),'utf8')).join('\n');
assert.match(docs,/PWRC balance never grants treasury authority|PWRC balance cannot grant treasury authority/);
assert.match(docs,/5%/);
assert.match(docs,/2 percentage points/);
assert.match(docs,/3 percentage points/);
assert.match(docs,/EXECUTION_UNKNOWN/);
assert.match(docs,/successful pool proceeds/i);
assert.match(docs,/\/api\/v1\/solana\/overview/);
assert.match(docs,/MARKET_DATA_UNAVAILABLE|market provider/i);
assert.match(docs,/PWRC_MINT/);
assert.match(docs,/CoinGecko/);
assert.match(docs,/CoinMarketCap/);
assert.match(docs,/Token-2022/);
assert.match(docs,/Next.js/);
console.log(`structure passed: ${required.length} required artifacts`);

assert.match(docs,/provider quorum|REQUIRED_PROVIDER_QUORUM/i);
assert.match(docs,/deployment fingerprint|deploymentFingerprintSha256/i);
assert.match(docs,/CycloneDX|SBOM/i);
assert.match(docs,/tamper-evident|payload SHA-256/i);

assert.match(docs,/SLO|error budget/i);
assert.match(docs,/circuit breaker|RPC failover/i);
assert.match(docs,/Ed25519|attestation/i);
