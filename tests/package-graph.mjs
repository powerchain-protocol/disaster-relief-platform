import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const readJson = (p) => JSON.parse(readFileSync(resolve(root, p), "utf8"));
const contract = readJson("packages/api-contract/package.json");
const client = readJson("packages/api-client/package.json");
const api = readJson("apps/backend/package.json");
const web = readJson("apps/web/package.json");
const workspace = readFileSync(resolve(root, "pnpm-workspace.yaml"), "utf8");

assert.equal(contract.name, "@powerchain/crisis-api-contract");
assert.equal(contract.exports["."].types, "./src/index.ts");
assert.equal(contract.types, "./src/index.ts");
assert.equal(client.dependencies["@powerchain/crisis-api-contract"], "workspace:*");
assert.match(client.scripts.prebuild, /crisis-api-contract/);
assert.match(api.scripts.prebuild, /crisis-api-contract/);
assert.match(web.scripts.prebuild, /crisis-api-client/);
assert.match(workspace, /allowBuilds:[\s\S]*esbuild: true/);
assert.match(workspace, /allowBuilds:[\s\S]*sharp: true/);
assert.match(workspace, /strictDepBuilds: true/);
console.log("Package graph PASS — contract resolution and pnpm build approvals are explicit");
