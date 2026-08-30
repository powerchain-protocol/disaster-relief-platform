import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, extname } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const requireBuild = process.argv.includes("--require-build");
const buildRoot = resolve(root, "apps/web/.next/static");
const secretNames = [
  "HELIUS_API_KEY", "SOLANA_RPC_URL", "HELIUS_RPC_URL", "PYTH_API_KEY", "JUPITER_API_KEY",
  "COINGECKO_API_KEY", "COINMARKETCAP_API_KEY", "BIRDEYE_API_KEY", "POWERCHAIN_INTERNAL_API_TOKEN",
];
const actualSecrets = secretNames.map(name => ({ name, value: process.env[name]?.trim() || "" })).filter(item => item.value.length >= 8);
const findings = [];

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = resolve(dir, name); const stat = statSync(path);
    if (stat.isDirectory()) out.push(...walk(path));
    else if ([".js", ".mjs", ".json", ".map", ".txt", ".html", ".css"].includes(extname(name))) out.push(path);
  }
  return out;
}

const sourceFiles = walk(resolve(root, "apps/web")).filter(path => !path.includes("/.next/") && !path.includes("/node_modules/"));
for (const file of sourceFiles) {
  const text = readFileSync(file, "utf8");
  for (const name of secretNames) if (text.includes(name) && !file.includes("lib/server/")) findings.push(`${file}: browser-reachable source references ${name}`);
  if (/NEXT_PUBLIC_(?:HELIUS|SOLANA_RPC|PYTH|JUPITER|COINGECKO|COINMARKETCAP|BIRDEYE|POWERCHAIN_INTERNAL)/.test(text)) findings.push(`${file}: sensitive NEXT_PUBLIC_* reference`);
}

if (!existsSync(buildRoot)) {
  if (requireBuild) findings.push("apps/web/.next/static is missing; build must complete before browser-bundle secret scanning");
} else {
  for (const file of walk(buildRoot)) {
    const text = readFileSync(file, "utf8");
    for (const { name, value } of actualSecrets) if (text.includes(value)) findings.push(`${file}: contains the configured value of ${name}`);
    for (const name of secretNames) if (text.includes(name)) findings.push(`${file}: contains secret environment variable name ${name}`);
  }
}

if (findings.length) {
  console.error("Browser secret gate failed:\n- " + findings.join("\n- "));
  process.exit(1);
}
console.log(existsSync(buildRoot) ? "Browser bundle secret gate passed" : "Browser source secret preflight passed (bundle scan requires build)");
