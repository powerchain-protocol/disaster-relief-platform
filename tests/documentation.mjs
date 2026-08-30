import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const root=resolve(new URL("..",import.meta.url).pathname);
const required=[
  "docs/README.md","docs/QUICKSTART.md","docs/ARCHITECTURE.md","docs/API_REFERENCE.md","docs/ENVIRONMENT_REFERENCE.md",
  "docs/SOLANA_RUNTIME.md","docs/PROGRAM_VERIFICATION.md","docs/TOKEN_INSPECTION.md","docs/MARKET_DATA.md","docs/PROVIDER_OPERATIONS.md",
  "docs/WEB_PROXY.md","docs/WEBSOCKETS.md","docs/SECURITY.md","docs/PRODUCTION_DEPLOYMENT.md","docs/OPERATIONS_RUNBOOK.md",
  "docs/TROUBLESHOOTING.md","docs/TESTING_VALIDATION.md","docs/RELEASE_ACCEPTANCE.md","docs/DEPLOYMENT_EVIDENCE.md","docs/ROLLBACK.md","docs/PWRC_UTILITY.md","docs/FEES_ECONOMICS.md","docs/CROSS_CHAIN.md",
  "docs/TOKEN_FACTORY.md","docs/COMMUNITY_REWARDS_FULL.md","docs/CHARTS_DATA_PROVENANCE_FULL.md","docs/SDK_CLIENT.md","docs/POSTMAN.md",
  "docs/CONTRIBUTING.md","docs/GLOSSARY.md","docs/handbook/PowerChain-Crisis-Full-Documentation-v1.0.0.docx","docs/handbook/PowerChain-Crisis-Full-Documentation-v1.0.0.pdf",
  "apps/web/public/docs/full-documentation.docx","apps/web/public/docs/full-documentation.pdf"
];
for(const f of required) assert.ok(existsSync(resolve(root,f)),`missing ${f}`);
const all=required.filter(f=>f.endsWith('.md')).map(f=>readFileSync(resolve(root,f),'utf8')).join('\n');
for(const phrase of ["getTokenSupply","PWRC_MINT","Token-2022","MARKET_DATA_UNAVAILABLE","EXECUTION_UNKNOWN","5%","2 percentage points","3 percentage points","POWERCHAIN_INTERNAL_API_TOKEN","SOLANA_EXPECTED_GENESIS_HASH"]){assert.ok(all.includes(phrase),`docs missing ${phrase}`)}
console.log(`documentation passed: ${required.length} required artifacts`);
