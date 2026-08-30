import { createPublicKey, verify as verifySignature } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { canonicalSha256, fileSha256, sha256 } from "./lib/release-integrity.mjs";

const root=resolve(new URL("..",import.meta.url).pathname);
const deploymentId=process.env.RELEASE_DEPLOYMENT_ID?.trim();
const candidate=process.env.RELEASE_EVIDENCE_FILE?.trim()||(deploymentId?`release/evidence/deployment-${deploymentId}.json`:"");
if(!candidate){console.error("RELEASE_DEPLOYMENT_ID or RELEASE_EVIDENCE_FILE is required");process.exit(1)}
const evidencePath=resolve(root,candidate);if(!existsSync(evidencePath)){console.error(`Deployment evidence not found: ${evidencePath}`);process.exit(1)}
let evidence;try{evidence=JSON.parse(readFileSync(evidencePath,"utf8"))}catch{console.error("Deployment evidence is not valid JSON");process.exit(1)}
const failures=[];const hex64=v=>typeof v==="string"&&/^[a-f0-9]{64}$/i.test(v);const imageDigest=v=>typeof v==="string"&&/^sha256:[a-f0-9]{64}$/i.test(v);
if(evidence.schemaVersion!=="1.0.0"||evidence.releaseVersion!=="1.0.0")failures.push("evidence version must be 1.0.0");
if(evidence.environment!=="production")failures.push("environment must be production");
if(!/^[a-f0-9]{7,64}$/i.test(evidence.commitSha||""))failures.push("commitSha is invalid");
if(!imageDigest(evidence.images?.api)||!imageDigest(evidence.images?.web))failures.push("API/web image digests must be sha256 digests");
if(!hex64(evidence.dependencyLock?.digest))failures.push("dependency lock digest is invalid");
if(!hex64(evidence.config?.digest)||evidence.config?.secretsIncluded!==false)failures.push("redacted configuration digest is invalid");
if(!evidence.cluster?.intended||evidence.cluster.intended!==evidence.cluster.observed)failures.push("intended and observed cluster must match");
if(evidence.cluster?.expectedGenesisHash&&evidence.cluster.expectedGenesisHash!==evidence.cluster.genesisHash)failures.push("observed genesis does not match expected genesis");
if(!Array.isArray(evidence.programs)||evidence.programs.length<1||evidence.programs.some(p=>!p.programId||p.state!=="DEPLOYED"||p.deploymentVerified!==true||!hex64(p.deploymentFingerprintSha256)))failures.push("all recorded required programs must be verified DEPLOYED programs with fingerprints");
if(!Array.isArray(evidence.providers)||evidence.providers.filter(p=>p.required).length<1||evidence.providers.some(p=>p.required&&(p.state!=="LIVE"||p.fresh!==true||!p.lastCheckedAt)))failures.push("all recorded required providers must be LIVE and fresh");
if(evidence.providerQuorum?.met!==true||evidence.providerQuorum?.rawMet!==true||evidence.providerQuorum?.effectiveMet!==true||Number(evidence.providerQuorum?.observed??0)<Number(evidence.providerQuorum?.required??1))failures.push("provider quorum evidence invalid");
if(evidence.approvals?.status!=="APPROVED"||!hex64(evidence.approvals?.recordSha256))failures.push("approval evidence is invalid");
for(const artifact of ["sbom","provenance","releasePolicy","programChangeControl","canary"])if(!hex64(evidence.artifacts?.[artifact]?.sha256))failures.push(`${artifact} evidence is invalid`);
for(const key of ["frozenInstall","typecheck","test","build","releaseArtifacts","releasePolicy","productionConfig","browserSecrets","runbookRollbackApproval","rollbackTarget","programChangeControl","canary","readiness","slo","requiredPrograms","programFingerprints","providerTelemetry","providerQuorum"])if(evidence.validation?.[key]!=="PASS")failures.push(`validation.${key} must be PASS`);
if(evidence.validation?.predeploy?.result!=="PASS"||!hex64(evidence.validation?.predeploy?.reportSha256))failures.push("predeploy report binding is invalid");
if(evidence.validation?.liveVerification?.result!=="PASS"||!hex64(evidence.validation?.liveVerification?.reportSha256))failures.push("live verification report binding is invalid");
const clone=structuredClone(evidence);const integrity=clone.integrity;delete clone.integrity;if(!hex64(integrity?.payloadSha256)||integrity.payloadSha256!==canonicalSha256(clone))failures.push("deployment evidence payload integrity mismatch");
const bindings=[
  ["pnpm-lock.yaml",evidence.dependencyLock?.digest],
  ["release/evidence/release-acceptance-predeploy.json",evidence.validation?.predeploy?.reportSha256],
  ["release/evidence/live-verification.json",evidence.validation?.liveVerification?.reportSha256],
  ["release/evidence/sbom.cdx.json",evidence.artifacts?.sbom?.sha256],
  ["release/evidence/release-provenance.json",evidence.artifacts?.provenance?.sha256],
  ["release/evidence/release-policy-validation.json",evidence.artifacts?.releasePolicy?.sha256],
  ["release/evidence/program-change-control.json",evidence.artifacts?.programChangeControl?.sha256],
  ["release/evidence/canary-verification.json",evidence.artifacts?.canary?.sha256],
  ["release/evidence/rollback-target.json",evidence.rollback?.recordSha256],
  [process.env.RELEASE_APPROVAL_FILE||"release/approvals/runbook-rollback.json",evidence.approvals?.recordSha256],
];
for(const [file,digest] of bindings){const path=resolve(root,file);if(existsSync(path)&&digest!==fileSha256(path))failures.push(`${file} digest mismatch`)}
if(evidence.previousEvidence?.source){const path=resolve(root,evidence.previousEvidence.source);if(existsSync(path)){let prev;try{prev=JSON.parse(readFileSync(path,"utf8"))}catch{}if(evidence.previousEvidence.fileSha256!==fileSha256(path))failures.push("previous evidence file digest mismatch");if(prev?.integrity?.payloadSha256!==evidence.integrity?.previousPayloadSha256)failures.push("previous evidence payload-chain mismatch")}}
const requireAttestation=process.env.RELEASE_REQUIRE_ATTESTATION==="true";
if(requireAttestation){
  const id=evidence.deploymentId||deploymentId;const attestationPath=resolve(root,process.env.RELEASE_ATTESTATION_FILE?.trim()||`release/evidence/deployment-${id}.attestation.json`);
  if(!existsSync(attestationPath))failures.push("required deployment attestation is missing");else{
    try{
      const att=JSON.parse(readFileSync(attestationPath,"utf8"));
      if(att.algorithm!=="Ed25519"||att.deploymentId!==evidence.deploymentId)failures.push("attestation metadata invalid");
      if(att.evidenceFileSha256!==fileSha256(evidencePath)||att.payloadSha256!==integrity?.payloadSha256)failures.push("attestation evidence binding mismatch");
      const der=Buffer.from(att.publicKeySpkiBase64||"","base64");const keyHash=sha256(der);if(keyHash!==att.publicKeySha256)failures.push("attestation public-key fingerprint mismatch");
      const pinned=process.env.RELEASE_ATTESTATION_PUBLIC_KEY_SHA256?.trim().toLowerCase();if(pinned&&pinned!==keyHash)failures.push("attestation signer differs from pinned public key");
      const key=createPublicKey({key:der,format:"der",type:"spki"});const message=Buffer.from(`${evidence.deploymentId}\n${integrity.payloadSha256}\n${fileSha256(evidencePath)}`);if(!verifySignature(null,message,key,Buffer.from(att.signatureBase64||"","base64")))failures.push("deployment attestation signature invalid");
    }catch(error){failures.push(`deployment attestation verification error: ${error instanceof Error?error.message:String(error)}`)}
  }
}
if(failures.length){console.error("Deployment evidence verification failed:\n- "+failures.join("\n- "));process.exit(1)}console.log(`Deployment evidence verified: ${candidate}`);
