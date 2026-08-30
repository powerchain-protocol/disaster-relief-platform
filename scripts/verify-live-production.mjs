import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const base = (process.env.RELEASE_API_URL || "").replace(/\/$/, "");
if (!base) { console.error("RELEASE_API_URL is required"); process.exit(1); }
const headers = { accept: "application/json" };
if (process.env.POWERCHAIN_INTERNAL_API_TOKEN?.trim()) headers["x-powerchain-internal-token"] = process.env.POWERCHAIN_INTERNAL_API_TOKEN.trim();
const timeoutMs = Number(process.env.RELEASE_VERIFY_TIMEOUT_MS || 12000);
const get = async path => {
  const response = await fetch(`${base}${path}`, { headers, cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
  const text = await response.text(); let body; try { body = JSON.parse(text); } catch { body = { raw: text }; }
  if (!response.ok) throw new Error(`${path} returned ${response.status}: ${JSON.stringify(body)}`);
  return body;
};
const requiredProviders = (process.env.REQUIRED_HEALTHY_PROVIDERS || "SOLANA_RPC").split(",").map(v=>v.trim()).filter(Boolean);
const requiredQuorum = Math.max(1, Number(process.env.REQUIRED_PROVIDER_QUORUM || 1));
const maxTelemetryAge = Math.max(15, Number(process.env.PROVIDER_TELEMETRY_MAX_AGE_SECONDS || 180));
const intendedCluster = process.env.SOLANA_NETWORK || "mainnet-beta";
let expectedFingerprints={}; try{expectedFingerprints=JSON.parse(process.env.EXPECTED_PROGRAM_FINGERPRINTS_JSON||"{}")}catch{console.error("EXPECTED_PROGRAM_FINGERPRINTS_JSON is invalid");process.exit(1)}
const failures = [];
let ready, programs, providers, slo;
try { [ready, programs, providers, slo] = await Promise.all([get("/api/v1/ready"), get("/api/v1/solana/programs"), get("/api/v1/providers/status"), get("/api/v1/observability/slo")]); }
catch (error) { console.error(error instanceof Error ? error.message : error); process.exit(1); }
if (ready.ready !== true) failures.push("readiness.ready must be true");
if (ready.network !== intendedCluster) failures.push(`readiness network ${ready.network} != intended ${intendedCluster}`);
if (ready.checks?.cluster?.ok !== true) failures.push("readiness cluster check must pass");
if (ready.checks?.programs?.ok !== true) failures.push("readiness required-program/fingerprint check must pass");
if (ready.checks?.providers?.ok !== true) failures.push("readiness provider-health check must pass");
if (ready.checks?.providerQuorum?.ok !== true) failures.push("readiness provider-quorum check must pass");
if (process.env.READINESS_REQUIRE_SLO === "true" && ready.checks?.slo?.ok !== true) failures.push("readiness SLO check must pass");
if (programs.network !== intendedCluster) failures.push(`program verification network ${programs.network} != intended ${intendedCluster}`);
if (programs.verification?.requiredMissing !== 0) failures.push(`required programs missing: ${programs.verification?.requiredMissing ?? "unknown"}`);
for (const program of programs.programs?.filter(p => p.required) || []) {
  if (!program.deploymentVerified || program.state !== "DEPLOYED") failures.push(`required program not verified: ${program.slug}`);
  if (!/^[a-f0-9]{64}$/i.test(program.deploymentFingerprintSha256||"")) failures.push(`required program missing deployment fingerprint: ${program.slug}`);
  const expected=expectedFingerprints[program.slug];
  if (!expected || expected.toLowerCase() !== String(program.deploymentFingerprintSha256||"").toLowerCase()) failures.push(`required program fingerprint mismatch: ${program.slug}`);
}
for (const name of requiredProviders) {
  const provider = providers.providers?.find(p => p.provider === name);
  if (!provider) failures.push(`required provider absent: ${name}`);
  else if (!provider.configured || provider.state !== "LIVE" || provider.fresh !== true || !provider.lastCheckedAt || provider.ageSeconds == null || provider.ageSeconds > maxTelemetryAge) failures.push(`required provider unhealthy/stale: ${name} (${provider.state}, age=${provider.ageSeconds})`);
}
if (providers.summary?.rawQuorumMet !== true || providers.summary?.quorumMet !== true || Number(providers.summary?.liveMarketProviders ?? 0) < requiredQuorum) failures.push(`market provider quorum not met: ${providers.summary?.liveMarketProviders ?? 0}/${requiredQuorum}`);
if (Number(providers.rpc?.endpointCount ?? 0) < 2) failures.push("RPC failover requires at least two configured endpoints");
if (!providers.rpc?.activeEndpointId) failures.push("RPC telemetry must identify an active endpoint");
if (process.env.READINESS_REQUIRE_SLO === "true" && (slo?.evaluable !== true || slo?.ok !== true)) failures.push(`SLO not healthy/evaluable: samples=${slo?.sampleCount ?? 0}`);
const report = { schemaVersion:"1.0.0", releaseVersion:"1.0.0", checkedAt:new Date().toISOString(), apiBase:base, intendedCluster, requiredProviders, requiredQuorum, maxTelemetryAge, expectedFingerprints, ready, programs, providers, slo, result: failures.length ? "FAIL" : "PASS", failures };
mkdirSync(resolve(root,"release/evidence"),{recursive:true});
writeFileSync(resolve(root,"release/evidence/live-verification.json"), JSON.stringify(report,null,2)+"\n");
if (failures.length) { console.error("Live production verification failed:\n- "+failures.join("\n- ")); process.exit(1); }
console.log("Live production verification passed");
