import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { canonicalSha256 } from "./lib/release-integrity.mjs";

const root = resolve(new URL("..", import.meta.url).pathname);
const result = spawnSync("pnpm", ["list", "-r", "--depth", "Infinity", "--json"], { cwd: root, encoding: "utf8", env: process.env });
if (result.status !== 0) {
  console.error(result.stderr || result.stdout || "pnpm list failed");
  process.exit(result.status ?? 1);
}
let trees;
try { trees = JSON.parse(result.stdout); } catch { console.error("pnpm list did not return valid JSON"); process.exit(1); }
const components = new Map();
function walk(node) {
  if (!node || typeof node !== "object") return;
  if (typeof node.name === "string" && typeof node.version === "string") {
    const key = `${node.name}@${node.version}`;
    if (!components.has(key)) components.set(key, { type: "library", name: node.name, version: node.version, purl: `pkg:npm/${encodeURIComponent(node.name)}@${node.version}` });
  }
  for (const bucket of [node.dependencies, node.devDependencies, node.optionalDependencies]) {
    if (!bucket || typeof bucket !== "object") continue;
    for (const dep of Object.values(bucket)) walk(dep);
  }
}
for (const tree of Array.isArray(trees) ? trees : [trees]) walk(tree);
const body = {
  bomFormat: "CycloneDX", specVersion: "1.5", serialNumber: `urn:uuid:${randomUUID()}`, version: 1,
  metadata: { timestamp: new Date().toISOString(), tools: [{ vendor: "PowerChain Protocol", name: "release-sbom", version: "1.0.0" }], component: { type: "application", name: "powerchain-crisis", version: "1.0.0" } },
  components: [...components.values()].sort((a,b)=>`${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`)),
};
body.metadata.properties = [{ name: "powerchain:canonicalSha256", value: canonicalSha256(body.components) }];
const dir = resolve(root, "release/evidence"); mkdirSync(dir,{recursive:true});
const out = resolve(dir, "sbom.cdx.json"); writeFileSync(out, JSON.stringify(body,null,2)+"\n");
console.log(`SBOM generated: ${out} (${body.components.length} components)`);
