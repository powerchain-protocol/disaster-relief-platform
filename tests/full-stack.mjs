import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const root=resolve(new URL("..",import.meta.url).pathname);
const read=p=>readFileSync(resolve(root,p),"utf8");
for(const file of [
  "pnpm-workspace.yaml","tsconfig.base.json","apps/backend/package.json","apps/backend/src/app.ts","apps/backend/src/server.ts","apps/backend/.env.example",
  "apps/web/package.json","apps/web/app/page.tsx","apps/web/app/solana/page.tsx","apps/web/components/solana-operations-console.tsx","apps/web/hooks/use-polling-resource.ts","apps/web/.env.example",
  "packages/api-client/package.json","packages/api-client/src/index.ts","packages/api-contract/package.json","packages/api-contract/src/index.ts","docs/FULL_STACK.md","docker-compose.yml","apps/backend/Dockerfile","apps/web/Dockerfile"
]) assert.ok(existsSync(resolve(root,file)),`missing ${file}`);
const app=read("apps/backend/src/app.ts");
for(const route of ["/api/v1/health","/api/v1/ready","/api/v1/config/public","/api/v1/providers/status","/api/v1/observability/slo","/api/v1/openapi.json","/api/openapi.json","/api/docs","/api/v1/ws/solana"]) assert.ok(app.includes(route),`backend missing ${route}`);
assert.match(app,/bodyLimit:\s*1024 \* 1024/);assert.match(app,/rateLimit/);assert.match(app,/helmet/);assert.match(app,/timingSafeEqual/);assert.match(app,/persistAuthorization:\s*false/);assert.match(app,/maxPayload:\s*8 \* 1024/);
const client=read("packages/api-client/src/index.ts");
for(const method of ["health()","ready()","publicConfig()","providerStatus()","sloStatus()","solanaOverview()","solanaPrograms()","solanaMarket(","solanaAsset("]) assert.ok(client.includes(method),`client missing ${method}`);
const webFiles=["apps/web/app/page.tsx","apps/web/app/solana/page.tsx","apps/web/components/solana-operations-console.tsx","apps/web/hooks/use-polling-resource.ts","apps/web/lib/api.ts","apps/web/lib/server/powerchain-api-proxy.ts"].map(read).join("\n");
for(const secret of ["HELIUS_API_KEY","SOLANA_RPC_URL","PYTH_API_KEY","JUPITER_API_KEY","COINGECKO_API_KEY","COINMARKETCAP_API_KEY","BIRDEYE_API_KEY"]) assert.ok(!webFiles.includes(secret),`web runtime references backend secret ${secret}`);
assert.doesNotMatch(webFiles,/NEXT_PUBLIC_(HELIUS|SOLANA_RPC|PYTH|JUPITER|COINGECKO|COINMARKETCAP|BIRDEYE)/);
assert.match(read("apps/web/lib/server/powerchain-api-proxy.ts"),/import "server-only"/);
assert.match(read("apps/web/components/solana-operations-console.tsx"),/Inspect mint/);
assert.match(read("apps/web/components/solana-operations-console.tsx"),/solanaMarket/);
assert.match(read("apps/web/components/solana-operations-console.tsx"),/solanaAsset/);
for(const route of ["apps/web/app/api/v1/health/route.ts","apps/web/app/api/v1/ready/route.ts","apps/web/app/api/v1/config/public/route.ts","apps/web/app/api/v1/providers/status/route.ts","apps/web/app/api/v1/observability/slo/route.ts","apps/web/app/api/v1/openapi.json/route.ts","apps/web/app/api/openapi.json/route.ts"]) assert.ok(existsSync(resolve(root,route)),`missing website proxy ${route}`);
console.log("full-stack wiring, security boundary, client and UI checks passed");

assert.match(read("apps/backend/src/services/solana-data.ts"),/const inflight = new Map/);
assert.match(read("apps/backend/src/services/solana-data.ts"),/getProviderStatus/);
assert.match(read("apps/backend/src/services/solana-data.ts"),/HELIUS_DAS/);
assert.match(read("apps/web/hooks/use-polling-resource.ts"),/document\.visibilityState/);
assert.match(read("apps/web/hooks/use-polling-resource.ts"),/inFlight/);
assert.match(read("apps/web/next.config.ts"),/Content-Security-Policy/);

assert.match(read("apps/backend/src/services/solana-data.ts"),/getProviderStatus/);

for(const file of [
  "tests/release-evidence-runtime.mjs","tests/slo-runtime.mjs","scripts/check-dependency-lock.mjs","scripts/check-browser-secrets.mjs","scripts/check-approvals.mjs","scripts/verify-live-production.mjs","scripts/record-deployment-evidence.mjs","scripts/verify-deployment-evidence.mjs","scripts/release-gate.mjs",
  "docs/RELEASE_ACCEPTANCE.md","docs/DEPLOYMENT_EVIDENCE.md","docs/ROLLBACK.md","release/approvals/runbook-rollback.json","release/evidence/deployment-evidence.example.json","release/evidence/hermetic-integration-validation.json",".github/workflows/release-gate.yml",".github/workflows/bootstrap-lockfile.yml",".nvmrc",".env.production.example"
]) assert.ok(existsSync(resolve(root,file)),`missing release artifact ${file}`);
assert.match(read("apps/backend/src/app.ts"),/READINESS_STRICT/);
assert.match(read("apps/backend/src/app.ts"),/requiredMissing/);
assert.match(read("apps/backend/src/app.ts"),/REQUIRED_HEALTHY_PROVIDERS/);
assert.match(read("scripts/check-browser-secrets.mjs"),/\.next\/static/);
assert.match(read("scripts/record-deployment-evidence.mjs"),/API_IMAGE_DIGEST/);
assert.match(read("scripts/record-deployment-evidence.mjs"),/WEB_IMAGE_DIGEST/);
assert.match(read("scripts/record-deployment-evidence.mjs"),/dependencyLock/);
assert.match(read("scripts/record-deployment-evidence.mjs"),/release-acceptance-predeploy\.json/);
assert.match(read("scripts/record-deployment-evidence.mjs"),/reportSha256/);
assert.match(read(".github/workflows/release-gate.yml"),/release:predeploy/);
assert.match(read(".github/workflows/release-gate.yml"),/release:postdeploy/);
assert.match(read("scripts/check-approvals.mjs"),/runbookSha256/);
assert.match(read("scripts/check-approvals.mjs"),/rollbackSha256/);
assert.match(read("scripts/verify-deployment-evidence.mjs"),/pnpm-lock.yaml digest mismatch|dependency lock digest is invalid/);
assert.match(read("scripts/release-gate.mjs"),/stopped after failed pre-deploy acceptance/);
console.log("release acceptance wiring checks passed");

assert.match(read("apps/backend/src/services/solana-data.ts"),/PROVIDER_TELEMETRY_MAX_AGE_SECONDS/);
assert.match(read("apps/backend/src/services/solana-data.ts"),/deploymentFingerprintSha256/);
assert.match(read("apps/backend/src/app.ts"),/providerQuorum/);
assert.match(read("scripts/record-deployment-evidence.mjs"),/payloadSha256/);
assert.match(read("scripts/check-rollback-target.mjs","scripts/check-release-policy.mjs","scripts/check-program-change-control.mjs","scripts/canary-verify.mjs","scripts/sign-deployment-evidence.mjs"),/ROLLBACK_TARGET_VERIFIED/);

assert.match(read("apps/backend/src/services/solana-data.ts"),/RPC_CIRCUIT_FAILURE_THRESHOLD/);
assert.match(read("apps/backend/src/services/solana-data.ts"),/PROVIDER_QUORUM_FAILURE_HYSTERESIS/);
assert.match(read("apps/backend/src/app.ts"),/observability\/slo/);
assert.match(read("scripts/sign-deployment-evidence.mjs"),/Ed25519/);
