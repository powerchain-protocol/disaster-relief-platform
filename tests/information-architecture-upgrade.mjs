import assert from"node:assert/strict";import{existsSync,readFileSync}from"node:fs";
for(const p of["../apps/web/components/features.tsx","../apps/web/components/trust-architecture.tsx","../apps/web/components/provider-architecture.tsx","../apps/web/app/docs/page.tsx"])assert.ok(existsSync(new URL(p,import.meta.url)),`missing ${p}`);
const home=readFileSync(new URL("../apps/web/app/page.tsx",import.meta.url),"utf8");
const faq=readFileSync(new URL("../apps/web/components/faq.tsx",import.meta.url),"utf8");
assert.ok(home.includes("<Features />"));assert.ok(home.includes("<TrustArchitecture />"));assert.ok(home.includes("<ProviderArchitecture />"));
assert.ok(faq.includes("verified impact"));assert.ok(faq.includes("connecting a wallet"));
console.log("Information architecture upgrade PASS");