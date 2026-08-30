import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { canonicalSha256, fileSha256, sha256 } from "./lib/release-integrity.mjs";
const root=resolve(new URL("..",import.meta.url).pathname);
function command(cmd,args){const r=spawnSync(cmd,args,{cwd:root,encoding:"utf8"});return r.status===0?r.stdout.trim():null;}
function treeDigest(dir){ if(!existsSync(dir)) return null; const rows=[]; const walk=d=>{for(const name of readdirSync(d).sort()){const p=resolve(d,name);const st=statSync(p);if(st.isDirectory()){if(name==="cache")continue;walk(p);}else rows.push(`${relative(dir,p)}\0${fileSha256(p)}`);}};walk(dir);return sha256(rows.join("\n"));}
let commit=process.env.RELEASE_COMMIT_SHA?.trim()||null; if(!commit){try{commit=execFileSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).trim();}catch{}}
const lock=resolve(root,"pnpm-lock.yaml"); if(!existsSync(lock)){console.error("pnpm-lock.yaml is required");process.exit(1);}
const manifests=["package.json","apps/backend/package.json","apps/web/package.json","packages/api-client/package.json","packages/api-contract/package.json"].filter(f=>existsSync(resolve(root,f))).map(path=>({path,sha256:fileSha256(resolve(root,path))}));
const provenance={schemaVersion:"1.0.0",releaseVersion:"1.0.0",generatedAt:new Date().toISOString(),commitSha:commit,toolchain:{node:process.version,pnpm:command("pnpm",["--version"])},dependencyLock:{sha256:fileSha256(lock)},manifests,build:{apiDistSha256:treeDigest(resolve(root,"apps/backend/dist")),webNextSha256:treeDigest(resolve(root,"apps/web/.next")),webBuildId:existsSync(resolve(root,"apps/web/.next/BUILD_ID"))?readFileSync(resolve(root,"apps/web/.next/BUILD_ID"),"utf8").trim():null}};
provenance.integrity={algorithm:"sha256",payloadSha256:canonicalSha256(provenance)};
const dir=resolve(root,"release/evidence");mkdirSync(dir,{recursive:true});const out=resolve(dir,"release-provenance.json");writeFileSync(out,JSON.stringify(provenance,null,2)+"\n");console.log(`Release provenance generated: ${out}`);
