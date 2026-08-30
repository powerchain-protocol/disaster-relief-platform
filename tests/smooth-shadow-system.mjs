import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css=readFileSync(new URL("../apps/web/app/globals.css",import.meta.url),"utf8");

for(const token of ["--shadow-xs","--shadow-sm","--shadow-md","--shadow-lg","--shadow-float"]){
  assert.ok(css.includes(token),`missing ${token}`);
}
assert.ok(css.includes(".product-mega-menu"));
assert.ok(css.includes(".reference-cta"));
assert.ok(css.includes("@media (prefers-reduced-motion:reduce)"));
console.log("Smooth shadow system PASS");
