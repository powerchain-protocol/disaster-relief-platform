import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

for (const p of [
  "../apps/web/components/mobile-nav.tsx",
  "../apps/web/components/system-status.tsx",
  "../apps/web/components/partner-strip.tsx",
  "../apps/web/components/cta.tsx",
  "../apps/web/app/status/page.tsx",
  "../apps/web/app/sitemap.ts",
  "../apps/web/app/robots.ts",
]) {
  assert.ok(existsSync(new URL(p, import.meta.url)), `missing ${p}`);
}

const shell=readFileSync(new URL("../apps/web/components/site-shell.tsx",import.meta.url),"utf8");
const config=readFileSync(new URL("../apps/backend/src/config/validate-runtime-config.ts",import.meta.url),"utf8");
const wallet=readFileSync(new URL("../apps/backend/src/api/v1/wallet.ts",import.meta.url),"utf8");

assert.ok(shell.includes("MobileNav"));
assert.ok(shell.includes('href="/status"'));
assert.ok(config.includes("CORS_ORIGINS"));
assert.ok(config.includes("SOLANA_EXPECTED_GENESIS_HASH"));
assert.ok(wallet.includes("rateLimit"));

console.log("Site status + navigation improvements PASS");
