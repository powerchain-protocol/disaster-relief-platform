import assert from"node:assert/strict";import{existsSync,readFileSync}from"node:fs";import{readFile}from"node:fs/promises";
for(const p of["../docs/ARCHITECTURE.md","../docs/API_ARCHITECTURE.md","../docs/UI_UX_SYSTEM.md","../docs/OPERATIONS.md","../apps/web/components/motion.tsx","../apps/web/components/dashboard-motion-shell.tsx","../apps/backend/src/utils/api-response.ts"])assert.ok(existsSync(new URL(p,import.meta.url)),`missing ${p}`);
const pkg=JSON.parse(await readFile(new URL("../apps/web/package.json",import.meta.url),"utf8"));
const ui=readFileSync(new URL("../docs/UI_UX_SYSTEM.md",import.meta.url),"utf8");
assert.equal(pkg.dependencies["framer-motion"],"13.1.1");
assert.ok(ui.includes("prefers-reduced-motion"));
console.log("Docs + API + Framer Motion upgrade PASS");