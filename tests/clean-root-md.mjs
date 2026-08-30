import assert from "node:assert/strict";
import { existsSync,readdirSync } from "node:fs";
const root=new URL("../",import.meta.url);
const md=readdirSync(root).filter(x=>x.endsWith(".md")).sort();
assert.deepEqual(md,["CHANGELOG.md","README.md"]);
for(const p of["../docs/BUILD_STATUS.md","../docs/PROGRAMS.md","../docs/CONTRIBUTORS.md"])
 assert.ok(existsSync(new URL(p,import.meta.url)),`missing ${p}`);
console.log("Clean root Markdown PASS:",md.join(", "));
