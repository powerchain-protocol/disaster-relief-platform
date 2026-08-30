import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { canonicalSha256, fileSha256 } from "./lib/release-integrity.mjs";
const root=resolve(new URL("..",import.meta.url).pathname);const failures=[];
const sbomPath=resolve(root,"release/evidence/sbom.cdx.json"), provenancePath=resolve(root,"release/evidence/release-provenance.json"), lockPath=resolve(root,"pnpm-lock.yaml");
let sbom,provenance;try{sbom=JSON.parse(readFileSync(sbomPath,"utf8"));}catch{failures.push("SBOM missing or invalid");}try{provenance=JSON.parse(readFileSync(provenancePath,"utf8"));}catch{failures.push("release provenance missing or invalid");}
if(sbom){if(sbom.bomFormat!=="CycloneDX"||sbom.specVersion!=="1.5"||!Array.isArray(sbom.components)||sbom.components.length<1)failures.push("SBOM contract invalid");}
if(provenance){const clone=structuredClone(provenance);delete clone.integrity;if(provenance.integrity?.payloadSha256!==canonicalSha256(clone))failures.push("release provenance integrity mismatch");if(existsSync(lockPath)&&provenance.dependencyLock?.sha256!==fileSha256(lockPath))failures.push("release provenance lock digest mismatch");if(!provenance.build?.apiDistSha256||!provenance.build?.webNextSha256)failures.push("release provenance must bind API and web build outputs");}
if(failures.length){console.error("Release artifact verification failed:\n- "+failures.join("\n- "));process.exit(1);}console.log("Release SBOM and provenance verified");
