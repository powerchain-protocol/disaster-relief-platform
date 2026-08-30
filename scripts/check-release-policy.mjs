import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { canonicalSha256, fileSha256 } from "./lib/release-integrity.mjs";

const root=resolve(new URL("..",import.meta.url).pathname);const path=resolve(root,"config/release-policy.json");const failures=[];
if(!existsSync(path)){console.error("config/release-policy.json is required");process.exit(1)}
let policy;try{policy=JSON.parse(readFileSync(path,"utf8"))}catch{console.error("release policy is invalid JSON");process.exit(1)}
if(policy.schemaVersion!=="1.0.0"||policy.releaseVersion!=="1.0.0")failures.push("release policy version must remain 1.0.0");
if(policy.cluster?.production!=="mainnet-beta"||policy.cluster?.requireGenesisPin!==true)failures.push("production cluster policy must require mainnet-beta + genesis pin");
if(Number(policy.providers?.minimumMarketQuorum)<2)failures.push("minimumMarketQuorum must be >= 2");
if(Number(policy.providers?.telemetryMaxAgeSeconds)<15||Number(policy.providers?.telemetryMaxAgeSeconds)>300)failures.push("telemetryMaxAgeSeconds must be 15..300");
if(Number(policy.providers?.quorumFailureHysteresis)<1||Number(policy.providers?.quorumRecoveryHysteresis)<1)failures.push("quorum hysteresis values must be >= 1");
if(Number(policy.rpc?.circuitFailureThreshold)<1||Number(policy.rpc?.circuitCooldownMs)<1000||Number(policy.rpc?.maxFailoverAttempts)<1)failures.push("RPC circuit/failover policy is invalid");
if(Number(policy.slo?.minimumSamples)<1||Number(policy.slo?.availabilityTargetPct)<90||Number(policy.slo?.p95TargetMs)<50)failures.push("SLO policy is invalid");
if(!Array.isArray(policy.programs?.required)||policy.programs.required.length<3)failures.push("required program policy must list canonical Launchpad programs");
if(policy.attestation?.algorithm!=="Ed25519"||policy.attestation?.requiredInProduction!==true)failures.push("production attestation policy must require Ed25519");
const pkg=JSON.parse(readFileSync(resolve(root,"package.json"),"utf8"));if(pkg.version!==policy.releaseVersion)failures.push("package version differs from release policy");if(pkg.packageManager!==`pnpm@${policy.runtime?.pnpm}`)failures.push("packageManager differs from release policy");
const report={schemaVersion:"1.0.0",releaseVersion:"1.0.0",checkedAt:new Date().toISOString(),policyFile:"config/release-policy.json",policyFileSha256:fileSha256(path),policyPayloadSha256:canonicalSha256(policy),result:failures.length?"FAIL":"PASS",failures};
mkdirSync(resolve(root,"release/evidence"),{recursive:true});writeFileSync(resolve(root,"release/evidence/release-policy-validation.json"),JSON.stringify(report,null,2)+"\n");
if(failures.length){console.error("Release policy gate failed:\n- "+failures.join("\n- "));process.exit(1)}console.log("Release policy gate passed");
