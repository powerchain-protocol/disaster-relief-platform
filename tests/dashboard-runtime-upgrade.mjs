import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

for (const p of [
  "../apps/web/hooks/use-mobile.ts",
  "../apps/web/hooks/use-solana-stream.ts",
  "../apps/web/utils/health.ts",
  "../apps/backend/src/utils/health.ts",
  "../apps/web/components/dashboard-header.tsx",
  "../apps/web/components/dashboard-footer.tsx",
  "../api/websockets.md"
]) assert.ok(existsSync(new URL(p, import.meta.url)), `missing ${p}`);

const pkg = JSON.parse(await readFile(new URL("../apps/web/package.json", import.meta.url), "utf8"));
const theme = readFileSync(new URL("../apps/web/components/theme-toggle.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../apps/web/app/solana/page.tsx", import.meta.url), "utf8");
const validation = readFileSync(new URL("../apps/backend/src/services/validation.ts", import.meta.url), "utf8");

assert.equal(pkg.dependencies["@radix-ui/react-icons"], "1.3.2");
assert.ok(theme.includes("MoonIcon"));
assert.ok(theme.includes("SunIcon"));
assert.ok(!theme.includes("theme-toggle-label"));
assert.ok(page.includes("DashboardHeader"));
assert.ok(page.includes("DashboardFooter"));
assert.ok(page.includes("dashboard-white-button"));
assert.ok(validation.includes("isValidSolanaSignature"));
console.log("Dashboard runtime upgrade PASS");
