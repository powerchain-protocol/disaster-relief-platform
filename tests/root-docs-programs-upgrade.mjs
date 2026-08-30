import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

for(const p of[
  "../README.md","../BUILD_STATUS.md","../CHANGELOG.md","../CONTRIBUTORS.md","../PROGRAMS.md",
  "../programs/registry.json","../programs/STATUS_SCHEMA.md"
]) assert.ok(existsSync(new URL(p,import.meta.url)),`missing ${p}`);

assert.ok(!existsSync(new URL("../apps/web/README.md",import.meta.url)));
assert.ok(!existsSync(new URL("../apps/backend/README.md",import.meta.url)));
assert.ok(!existsSync(new URL("../programs/README.md",import.meta.url)));

const registry=JSON.parse(await readFile(new URL("../programs/registry.json",import.meta.url),"utf8"));
assert.equal(registry.schemaVersion,"1.1.0");
assert.deepEqual(
  registry.programs.filter(p=>p.requiredForStrictReadiness).map(p=>p.slug),
  ["launchpad-registry","launch-policy","token-factory"]
);
for(const program of registry.programs){
  assert.ok(program.family);
  assert.ok(program.authorityDomain);
  assert.ok(program.fingerprintEnvironmentVariable);
  assert.ok(Array.isArray(program.verification));
}
const status=readFileSync(new URL("../BUILD_STATUS.md",import.meta.url),"utf8");
assert.ok(status.includes("production deployment not yet attested"));
console.log("Root docs + programs upgrade PASS");