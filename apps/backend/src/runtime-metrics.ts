export type SloSnapshot = {
  schemaVersion: "1.0.0";
  windowSeconds: number;
  sampleCount: number;
  minimumSamples: number;
  evaluable: boolean;
  availabilityPct: number | null;
  availabilityTargetPct: number;
  p95LatencyMs: number | null;
  p95TargetMs: number;
  availabilityOk: boolean | null;
  latencyOk: boolean | null;
  ok: boolean | null;
  windowStartedAt: string | null;
  fetchedAt: string;
};

type Sample = { at: number; durationMs: number; statusCode: number; path: string };
const samples: Sample[] = [];
const excludedPrefixes = ["/api/v1/health", "/api/v1/ready", "/api/v1/observability/slo", "/api/swagger", "/api/openapi.json", "/api/v1/openapi.json"];

function numeric(name: string, fallback: number, min: number, max: number) {
  const value = Number(process.env[name] ?? fallback);
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}
function prune(now = Date.now()) {
  const windowMs = numeric("SLO_WINDOW_SECONDS", 300, 30, 3600) * 1000;
  const cutoff = now - windowMs;
  while (samples.length && samples[0].at < cutoff) samples.shift();
}
export function recordHttpSample(path: string, statusCode: number, durationMs: number) {
  if (!path.startsWith("/api/") || excludedPrefixes.some(prefix => path.startsWith(prefix))) return;
  const now = Date.now();
  samples.push({ at: now, durationMs: Math.max(0, durationMs), statusCode, path });
  prune(now);
  const maxSamples = Math.floor(numeric("SLO_MAX_SAMPLES", 5000, 100, 100000));
  if (samples.length > maxSamples) samples.splice(0, samples.length - maxSamples);
}
function percentile(values: number[], p: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a,b)=>a-b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1));
  return sorted[index];
}
export function getSloSnapshot(): SloSnapshot {
  const now = Date.now(); prune(now);
  const windowSeconds = Math.floor(numeric("SLO_WINDOW_SECONDS", 300, 30, 3600));
  const minimumSamples = Math.floor(numeric("SLO_MIN_SAMPLES", 6, 1, 10000));
  const availabilityTargetPct = numeric("SLO_AVAILABILITY_TARGET_PCT", 99.5, 50, 100);
  const p95TargetMs = numeric("SLO_P95_TARGET_MS", 1500, 50, 60000);
  const count = samples.length;
  const evaluable = count >= minimumSamples;
  const successes = samples.filter(sample => sample.statusCode < 500).length;
  const availabilityPct = count ? Number(((successes / count) * 100).toFixed(4)) : null;
  const p95LatencyMs = percentile(samples.map(sample => sample.durationMs), 0.95);
  const availabilityOk = evaluable && availabilityPct != null ? availabilityPct >= availabilityTargetPct : null;
  const latencyOk = evaluable && p95LatencyMs != null ? p95LatencyMs <= p95TargetMs : null;
  return {
    schemaVersion: "1.0.0", windowSeconds, sampleCount: count, minimumSamples, evaluable,
    availabilityPct, availabilityTargetPct, p95LatencyMs, p95TargetMs,
    availabilityOk, latencyOk, ok: evaluable ? Boolean(availabilityOk && latencyOk) : null,
    windowStartedAt: count ? new Date(samples[0].at).toISOString() : null,
    fetchedAt: new Date(now).toISOString(),
  };
}
export function resetRuntimeMetricsForTests() { samples.length = 0; }
