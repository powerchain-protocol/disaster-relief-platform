import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const lockPath = resolve(root, "pnpm-lock.yaml");
const workspacePath = resolve(root, "pnpm-workspace.yaml");
const failures = [];

if (!existsSync(lockPath)) {
  failures.push("pnpm-lock.yaml is missing; run pnpm install with pnpm 11.24.0 in the canonical repository and commit the generated lockfile");
} else {
  const lock = readFileSync(lockPath, "utf8");
  if (!/^lockfileVersion:\s*['\"]?9(?:\.0)?['\"]?/m.test(lock)) failures.push("pnpm-lock.yaml must use pnpm lockfileVersion 9.x");
  const importers = [".", "apps/backend", "apps/web", "packages/api-client", "packages/api-contract", "packages/bridge", "packages/charts", "packages/fees", "packages/policy", "packages/rewards", "packages/token-factory", "packages/utility"];
  for (const importer of importers) {
    const escaped = importer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`^\\s{2}${escaped}:\\s*$`, "m").test(lock)) failures.push(`lockfile importer missing: ${importer}`);
  }
  const hash = createHash("sha256").update(lock).digest("hex");
  console.log(`pnpm-lock.yaml sha256=${hash}`);
}

const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
if (pkg.packageManager !== "pnpm@11.24.0") failures.push(`packageManager must be pnpm@11.24.0, got ${pkg.packageManager ?? "missing"}`);
if (pkg.engines?.node !== ">=24.20.0") failures.push(`engines.node must be >=24.20.0, got ${pkg.engines?.node ?? "missing"}`);
if (!readFileSync(workspacePath, "utf8").includes("packages:")) failures.push("pnpm-workspace.yaml is invalid or empty");

if (failures.length) {
  console.error("Dependency lock gate failed:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("Dependency lock gate passed");
