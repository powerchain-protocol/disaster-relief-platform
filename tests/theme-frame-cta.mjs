import assert from"node:assert/strict";import{readFileSync}from"node:fs";
const css=readFileSync(new URL("../apps/web/app/globals.css",import.meta.url),"utf8");
const cta=readFileSync(new URL("../apps/web/components/reference-cta.tsx",import.meta.url),"utf8");
assert.ok(css.includes("--cta-bg:#123d2d"));assert.ok(css.includes('[data-theme="dark"]'));assert.ok(css.includes("--frame:#e3e9e5"));assert.ok(css.includes("--frame:#294739"));assert.ok(css.includes(".reference-cta .reference-primary"));assert.ok(cta.includes("independently auditable"));
console.log("Theme frames + dark green CTA PASS");