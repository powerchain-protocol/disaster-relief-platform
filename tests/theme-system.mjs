import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const css=readFileSync(new URL("../apps/web/app/globals.css",import.meta.url),"utf8");
const layout=readFileSync(new URL("../apps/web/app/layout.tsx",import.meta.url),"utf8");
const toggle=readFileSync(new URL("../apps/web/components/theme-toggle.tsx",import.meta.url),"utf8");
const brand=readFileSync(new URL("../apps/web/components/brand-lockup.tsx",import.meta.url),"utf8");
assert.match(layout,/data-theme="light"/);
assert.match(layout,/ThemeScript/);
assert.match(toggle,/powerchain-theme/);
assert.match(toggle,/"light" \| "dark"/);
assert.match(css,/html\[data-theme="dark"\]/);
assert.match(css,/--pc-canvas:#f7f9f7/);
assert.match(css,/--pc-surface:#101713/);
assert.match(brand,/logo-green\.png/);
assert.match(brand,/logo-white\.png/);
for(const path of ["../apps/web/public/brand/logo-green.png","../apps/web/public/brand/logo-white.png","../apps/web/public/brand/app-icon-light.png","../apps/web/public/brand/app-icon-dark.png"]){assert.ok(existsSync(new URL(path,import.meta.url)),`missing ${path}`)}
console.log("Dual-theme system PASS");
