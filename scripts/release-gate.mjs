import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { canonicalSha256 } from "./lib/release-integrity.mjs";

const root=resolve(new URL("..",import.meta.url).pathname);const evidenceDir=resolve(root,"release/evidence");const mode=process.argv[2]||"all";if(!new Set(["predeploy","postdeploy","all"]).has(mode)){console.error("Usage: node scripts/release-gate.mjs [predeploy|postdeploy|all]");process.exit(2);}mkdirSync(evidenceDir,{recursive:true});
function execute(name,command,args=[]){const started=Date.now();const result=spawnSync(command,args,{cwd:root,stdio:"inherit",env:process.env});return{name,status:result.status===0?"PASS":"FAIL",exitCode:result.status??1,errorCode:result.error?.code??null,durationMs:Date.now()-started};}
function runSequence(definitions){const steps=[];let blocked=false;for(const [name,command,args] of definitions){if(blocked){steps.push({name,status:"SKIPPED",exitCode:null,errorCode:"BLOCKED_BY_PRIOR_FAILURE",durationMs:0});continue;}const step=execute(name,command,args);steps.push(step);if(step.status!=="PASS")blocked=true;}return{steps,ok:!blocked};}
function writeReport(phase,steps,ok){const report={schemaVersion:"1.0.0",releaseVersion:"1.0.0",mode:phase,generatedAt:new Date().toISOString(),result:ok?"PASS":"FAIL",steps};report.integrity={algorithm:"sha256",payloadSha256:canonicalSha256(report)};const body=JSON.stringify(report,null,2)+"\n";writeFileSync(resolve(evidenceDir,`release-acceptance-${phase}.json`),body);writeFileSync(resolve(evidenceDir,"release-acceptance-latest.json"),body);return report;}
function predeploy(){const definitions=[
  ["dependency-lock","node",["scripts/check-dependency-lock.mjs"]],
  ["frozen-install","pnpm",["install","--frozen-lockfile"]],
  ["typecheck","pnpm",["typecheck"]],
  ["test","pnpm",["test"]],
  ["build","pnpm",["build"]],
  ["release-sbom","node",["scripts/generate-sbom.mjs"]],
  ["release-provenance","node",["scripts/generate-release-provenance.mjs"]],
  ["release-artifacts","node",["scripts/verify-release-artifacts.mjs"]],
  ["release-policy","node",["scripts/check-release-policy.mjs"]],
  ["production-config","pnpm",["check:production"]],
  ["browser-secrets","node",["scripts/check-browser-secrets.mjs","--require-build"]],
  ["runbook-rollback-approval","node",["scripts/check-approvals.mjs"]],
  ["rollback-target","node",["scripts/check-rollback-target.mjs"]],
  ["program-change-control","node",["scripts/check-program-change-control.mjs"]],
];const result=runSequence(definitions);writeReport("predeploy",result.steps,result.ok);return result.ok;}
function postdeploy(){const definitions=[
  ["canary-verification","node",["scripts/canary-verify.mjs"]],
  ["live-readiness-programs-providers","node",["scripts/verify-live-production.mjs"]],
  ["deployment-evidence","node",["scripts/record-deployment-evidence.mjs"]],
  ["deployment-attestation","node",["scripts/sign-deployment-evidence.mjs"]],
  ["deployment-evidence-verify","node",["scripts/verify-deployment-evidence.mjs"]]
];const result=runSequence(definitions);writeReport("postdeploy",result.steps,result.ok);return result.ok;}
let ok;if(mode==="predeploy")ok=predeploy();else if(mode==="postdeploy")ok=postdeploy();else{const pre=predeploy();if(!pre){console.error("Release all gate stopped after failed pre-deploy acceptance; post-deploy verification was not attempted.");process.exit(1);}ok=postdeploy();}if(!ok)process.exit(1);console.log(`Release ${mode} gate passed`);
