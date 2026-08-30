import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = new URL("../", import.meta.url);
const read = path => readFileSync(new URL(path, root), "utf8");
const service = read("apps/backend/src/services/solana-data.ts");
const types = read("packages/api-contract/src/index.ts");
const v1 = read("apps/backend/src/api/v1/solana.ts");
const legacy = read("apps/backend/src/api/legacy-solana.ts");
const proxy = read("apps/web/lib/server/powerchain-api-proxy.ts");

for (const route of [
  "/api/v1/solana/overview",
  "/api/v1/solana/programs",
  "/api/v1/solana/market",
  "/api/v1/solana/assets/:mint",
]) assert.ok(v1.includes(route), `missing ${route}`);
for (const route of ["/api/solana/overview", "/api/token/market", "/api/assets/:mint"]) assert.ok(legacy.includes(route), `missing ${route}`);

// Canonical market is strict; compatibility market alone may default to PWRC_MINT.
assert.match(v1, /required:\s*\["mint"\]/);
assert.doesNotMatch(v1, /PWRC_MINT/);
assert.match(legacy, /process\.env\.PWRC_MINT/);
assert.match(legacy, /PWRC_MINT_NOT_CONFIGURED/);
assert.match(legacy, /deprecation/);
assert.match(legacy, /successor-version/);

// RPC/cluster health and block reference.
for (const method of ["getHealth","getSlot","getBlockHeight","getVersion","getLatestBlockhash","getGenesisHash"]) assert.ok(service.includes(`\"${method}\"`), `missing RPC ${method}`);
assert.match(service, /SOLANA_EXPECTED_GENESIS_HASH/);
assert.match(types, /blockhash:\s*string \| null/);
assert.match(types, /lastValidBlockHeight/);
assert.match(types, /latencyMs/);

// PowerChain Launchpad deployment verification.
for (const env of ["SOLANA_LAUNCHPAD_REGISTRY_PROGRAM_ID","SOLANA_LAUNCH_POLICY_PROGRAM_ID","SOLANA_TOKEN_FACTORY_PROGRAM_ID","SOLANA_TOKEN_2022_VESTING_PROGRAM_ID","SOLANA_LAUNCHPAD_ESCROW_PROGRAM_ID"]) assert.ok(service.includes(env), `missing ${env}`);
assert.match(service, /deploymentVerified/);
assert.match(service, /executable/);
assert.match(service, /BPFLoaderUpgradeab1e/);
assert.match(service, /POWERCHAIN_LAUNCHPAD/);

// SPL vs Token-2022 mint inspection.
assert.match(service, /TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA/);
assert.match(service, /TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb/);
assert.match(service, /getTokenSupply/);
assert.match(service, /mintAuthority/);
assert.match(service, /freezeAuthority/);
assert.match(service, /extensions/);
assert.match(service, /RPC_JSON_PARSED/);
assert.match(types, /tokenProgramKind/);
assert.match(types, /SPL_TOKEN/);
assert.match(types, /TOKEN_2022/);

// Multi-provider market resolution.
for (const provider of ["PYTH","JUPITER_PRICE_V3","COINGECKO","COINMARKETCAP","BIRDEYE","HELIUS_DAS"]) assert.ok(service.includes(`\"${provider}\"`), `missing market provider ${provider}`);
assert.match(service, /MARKET_PROVIDER_PRIORITY/);
assert.match(service, /COINGECKO_API_KEY/);
assert.match(service, /simple\/token_price\/solana/);
assert.match(service, /COINMARKETCAP_API_KEY/);
assert.match(service, /\/v1\/dex\/token\/price/);
assert.match(service, /PYTH_MINT_FEED_MAP_JSON/);
assert.match(service, /MARKET_DATA_UNAVAILABLE/);
assert.match(service, /CONFIGURED_PRIORITY_WITH_DIVERGENCE_CHECK/);
assert.match(service, /DISPLAY_AND_ANALYTICS_ONLY/);
assert.doesNotMatch(service, /priceUsd:\s*0\b/);
assert.doesNotMatch(service, /liquidityUsd:\s*0\b/);
assert.doesNotMatch(service, /balance\s*:\s*0\b/i);

// Website-origin proxy keeps provider secrets server-side and forwards only to backend.
assert.match(proxy, /import "server-only"/);
assert.match(proxy, /POWERCHAIN_API_URL/);
assert.match(proxy, /POWERCHAIN_INTERNAL_API_TOKEN/);
assert.match(proxy, /cache:\s*"no-store"/);
assert.match(proxy, /POWERCHAIN_API_PROXY_LOOP/);
const webRoot = resolve(new URL("../apps/web", import.meta.url).pathname);
const webFiles = [
  "lib/server/powerchain-api-proxy.ts",
  "app/api/v1/solana/overview/route.ts","app/api/v1/solana/programs/route.ts","app/api/v1/solana/market/route.ts","app/api/v1/solana/assets/[mint]/route.ts",
  "app/api/solana/overview/route.ts","app/api/token/market/route.ts","app/api/assets/[mint]/route.ts",
].map(file => readFileSync(resolve(webRoot,file),"utf8")).join("\n");
for (const secret of ["HELIUS_API_KEY","SOLANA_RPC_URL","PYTH_API_KEY","COINGECKO_API_KEY","COINMARKETCAP_API_KEY","BIRDEYE_API_KEY","JUPITER_API_KEY"]) assert.ok(!webFiles.includes(secret), `website proxy must not reference ${secret}`);


assert.match(service,/getMultipleAccounts/);
assert.match(service,/getProviderStatus/);
assert.match(service,/const inflight = new Map/);
assert.match(service,/heliusRpcUrl/);
assert.match(service,/fetchJson<JsonRpcResult<T>>\(url,[\s\S]*"HELIUS_DAS"/);
assert.match(service,/PYTH_MAX_CONFIDENCE_BPS/);

console.log("Solana API, mint-inspection, provider-resolution and Next proxy checks passed");
