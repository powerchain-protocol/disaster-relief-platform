import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

for(const p of["../apps/web/components/web3-icon.tsx","../apps/web/components/web3-ecosystem.tsx","../apps/web/components/hero-architecture.tsx","../apps/web/components/product-dropdown.tsx","../apps/web/components/programs-overview.tsx","../.nvmrc","../.nvmignore","../.gitignore","../.npmignore"])assert.ok(existsSync(new URL(p,import.meta.url)),`missing ${p}`);
const webPkg=JSON.parse(await readFile(new URL("../apps/web/package.json",import.meta.url),"utf8"));
const backendPkg=JSON.parse(await readFile(new URL("../apps/backend/package.json",import.meta.url),"utf8"));
const shell=readFileSync(new URL("../apps/web/components/site-shell.tsx",import.meta.url),"utf8");
const home=readFileSync(new URL("../apps/web/app/page.tsx",import.meta.url),"utf8");
const architecture=readFileSync(new URL("../apps/web/components/trust-architecture.tsx",import.meta.url),"utf8");

assert.equal(webPkg.dependencies["@web3icons/react"],"4.1.21");
assert.equal(backendPkg.devDependencies.tsx,"4.23.13");
const nav=shell.split('<nav className="site-nav"')[1].split("</nav>")[0];
assert.ok(!nav.includes("/legal"));
assert.ok(home.includes("<HeroArchitecture />"));
assert.ok(home.includes("<Web3Ecosystem />"));
assert.ok(architecture.includes("operation-connector"));
console.log("Web3 + header + programs upgrade PASS");