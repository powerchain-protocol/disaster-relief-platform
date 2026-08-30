import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url);let ts;try{ts=require("typescript")}catch{const candidates=["/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js","/usr/local/lib/node_modules/typescript/lib/typescript.js"];const candidate=candidates.find(existsSync);if(!candidate)throw new Error("typescript is required");ts=require(candidate)}
process.env.SLO_WINDOW_SECONDS="300";process.env.SLO_MIN_SAMPLES="6";process.env.SLO_AVAILABILITY_TARGET_PCT="99";process.env.SLO_P95_TARGET_MS="500";
const source=readFileSync(new URL("../apps/backend/src/runtime-metrics.ts",import.meta.url),"utf8");const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;const temp=join(tmpdir(),`powerchain-slo-runtime-${process.pid}.cjs`);writeFileSync(temp,compiled);const metrics=await import(`file://${temp}?t=${Date.now()}`);
try{
  metrics.resetRuntimeMetricsForTests();
  for(let i=0;i<5;i++)metrics.recordHttpSample("/api/v1/solana/overview",200,100+i*10);
  let snapshot=metrics.getSloSnapshot();assert.equal(snapshot.evaluable,false);assert.equal(snapshot.ok,null);
  metrics.recordHttpSample("/api/v1/solana/programs",200,180);snapshot=metrics.getSloSnapshot();assert.equal(snapshot.evaluable,true);assert.equal(snapshot.ok,true);assert.equal(snapshot.availabilityPct,100);assert.ok(snapshot.p95LatencyMs<=500);
  metrics.recordHttpSample("/api/v1/solana/programs",503,190);snapshot=metrics.getSloSnapshot();assert.equal(snapshot.availabilityOk,false);assert.equal(snapshot.ok,false);
  const before=snapshot.sampleCount;metrics.recordHttpSample("/api/v1/health",500,9000);assert.equal(metrics.getSloSnapshot().sampleCount,before);
  console.log("SLO runtime passed: warm-up, availability, latency, health-route exclusion");
}finally{try{unlinkSync(temp)}catch{}}
