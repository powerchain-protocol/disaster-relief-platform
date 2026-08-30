import assert from "node:assert/strict";import{readFileSync}from"node:fs";
const hero=readFileSync(new URL("../apps/web/components/hero.tsx",import.meta.url),"utf8");
const layout=readFileSync(new URL("../apps/web/app/layout.tsx",import.meta.url),"utf8");
const theme=readFileSync(new URL("../apps/web/components/theme-toggle.tsx",import.meta.url),"utf8");
assert.ok(hero.includes("globe-chain-architecture"));assert.ok(hero.includes("hero-architecture-card"));assert.ok(hero.includes("Solana + Token-2022"));assert.ok(layout.includes('data-theme="light"'));assert.ok(theme.includes('stored === "dark" ? "dark" : "light"'));
console.log("Light default + globe chain hero PASS");