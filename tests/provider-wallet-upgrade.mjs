import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
const files=[
"../apps/backend/src/providers/helius.ts","../apps/backend/src/providers/pyth.ts","../apps/backend/src/providers/birdeye.ts","../apps/backend/src/providers/coingecko.ts",
"../apps/backend/src/api/v1/wallet.ts","../apps/backend/src/services/wallet-data.ts",
"../apps/web/providers/wallet-provider.tsx","../apps/web/components/wallet-connect-modal.tsx","../apps/web/components/validate.tsx",
"../apps/web/data/fetch-wallet-data.ts","../apps/web/data/fetch-providers.ts","../apps/web/data/pyth.ts","../apps/web/data/birdeye.ts","../apps/web/data/coingecko.ts"
];
for(const f of files) assert.ok(existsSync(new URL(f,import.meta.url)),`missing ${f}`);
const pyth=readFileSync(new URL("../apps/backend/src/providers/pyth.ts",import.meta.url),"utf8");
const helius=readFileSync(new URL("../apps/backend/src/providers/helius.ts",import.meta.url),"utf8");
const wallet=readFileSync(new URL("../apps/web/providers/wallet-provider.tsx",import.meta.url),"utf8");
assert.match(pyth,/v2\/updates\/price\/latest/);
assert.match(pyth,/authorization:/i);
assert.match(helius,/getAssetsByOwner/);
assert.match(wallet,/Phantom/);
assert.match(wallet,/Solflare/);
assert.match(wallet,/Backpack/);
console.log("Provider + wallet upgrade PASS");
