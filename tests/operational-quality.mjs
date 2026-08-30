import assert from "node:assert/strict"; import {existsSync,readFileSync} from "node:fs";
for(const path of [
"../apps/backend/src/providers/http.ts","../apps/backend/src/config/validate-runtime-config.ts",
"../apps/web/components/provider-status-strip.tsx","../apps/web/app/loading.tsx","../apps/web/app/error.tsx","../apps/web/app/not-found.tsx"
]) assert.ok(existsSync(new URL(path,import.meta.url)),`missing ${path}`);
const server=readFileSync(new URL("../apps/backend/src/server.ts",import.meta.url),"utf8");
const wallet=readFileSync(new URL("../apps/web/providers/wallet-provider.tsx",import.meta.url),"utf8");
const network=readFileSync(new URL("../apps/web/app/network/page.tsx",import.meta.url),"utf8");
assert.match(server,/validateRuntimeConfig/);
assert.match(wallet,/onlyIfTrusted/);
assert.match(wallet,/accountChanged/);
assert.match(wallet,/powerchain-wallet-kind/);
assert.match(network,/ProviderStatusStrip/);
console.log("Operational quality improvements PASS");