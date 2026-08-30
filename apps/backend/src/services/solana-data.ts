import { createHash } from "node:crypto";
import type {
  DataSourceMeta,
  MarketObservation,
  MarketProvider,
  SolanaAssetResponse,
  SolanaCluster,
  SolanaMarketResponse,
  SolanaOverview,
  SolanaProgramInfo,
  TokenProgramKind,
} from "@powerchain/crisis-api-contract";

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_MAP = new Map([...BASE58].map((char, index) => [char, index] as const));
const DEFAULT_DIVERGENCE_BPS = 300;
const SPL_TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const BPF_LOADER_UPGRADEABLE = "BPFLoaderUpgradeab1e11111111111111111111111";
const BPF_LOADER = "BPFLoader1111111111111111111111111111111111";
const BPF_LOADER_2 = "BPFLoader2111111111111111111111111111111111";
const LOADER_V4 = "LoaderV411111111111111111111111111111111111";

type JsonRpcResult<T> = { jsonrpc: "2.0"; id: number | string; result?: T; error?: { code: number; message: string; data?: unknown } };
type CacheEntry<T> = { expiresAt: number; value: T };
const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

type ProviderTelemetry = {
  provider: string;
  configured: boolean;
  state: "LIVE" | "DEGRADED" | "UNCONFIGURED" | "UNKNOWN";
  lastCheckedAt: string | null;
  latencyMs: number | null;
  consecutiveFailures: number;
  lastErrorCode: string | null;
};
const providerTelemetry = new Map<string, ProviderTelemetry>();
const providerQuorumState = { initialized: false, effective: false, consecutivePasses: 0, consecutiveFailures: 0 };

function recordProviderTelemetry(provider: string, ok: boolean, latencyMs: number, errorCode?: string) {
  const previous = providerTelemetry.get(provider);
  providerTelemetry.set(provider, {
    provider,
    configured: true,
    state: ok ? "LIVE" : "DEGRADED",
    lastCheckedAt: nowIso(),
    latencyMs,
    consecutiveFailures: ok ? 0 : (previous?.consecutiveFailures ?? 0) + 1,
    lastErrorCode: ok ? null : errorCode ?? "UPSTREAM_ERROR",
  });
}


export class SolanaDataError extends Error {
  constructor(public readonly statusCode: number, public readonly code: string, message: string, public readonly details?: unknown) {
    super(message);
    this.name = "SolanaDataError";
  }
}

function nowIso() { return new Date().toISOString(); }
function sha256Hex(value: Uint8Array | string) { return createHash("sha256").update(value).digest("hex"); }
function telemetryMaxAgeSeconds() {
  const value = Number(process.env.PROVIDER_TELEMETRY_MAX_AGE_SECONDS ?? 180);
  return Number.isFinite(value) && value >= 15 ? Math.floor(value) : 180;
}
function telemetryAgeSeconds(value: string | null | undefined) {
  if (!value) return null;
  const age = Math.floor((Date.now() - Date.parse(value)) / 1000);
  return Number.isFinite(age) ? Math.max(0, age) : null;
}
function toFiniteNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(n) ? n : null;
}
function safeJson<T>(value: string | undefined, fallback: T): T {
  if (!value?.trim()) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}
function isProduction() { return process.env.NODE_ENV === "production" || process.env.POWERCHAIN_ENV === "production"; }
function allowDevFallback() { return !isProduction() && process.env.ALLOW_DEV_FALLBACK !== "false"; }
function cluster(): SolanaCluster {
  const value = process.env.SOLANA_NETWORK?.trim() || "mainnet-beta";
  if (value === "devnet" || value === "testnet" || value === "mainnet-beta") return value;
  throw new SolanaDataError(500, "SOLANA_NETWORK_INVALID", `Unsupported Solana network: ${value}`);
}

export function decodeBase58(value: string): Uint8Array {
  let num = 0n;
  for (const char of value) {
    const digit = BASE58_MAP.get(char);
    if (digit === undefined) throw new Error("INVALID_BASE58");
    num = num * 58n + BigInt(digit);
  }
  const bytes: number[] = [];
  while (num > 0n) { bytes.push(Number(num & 255n)); num >>= 8n; }
  bytes.reverse();
  let leading = 0;
  while (leading < value.length && value[leading] === "1") leading += 1;
  return Uint8Array.from([...new Array(leading).fill(0), ...bytes]);
}

export function encodeBase58(bytes: Uint8Array): string {
  let num = 0n;
  for (const byte of bytes) num = (num << 8n) + BigInt(byte);
  let out = "";
  while (num > 0n) { const remainder = Number(num % 58n); out = BASE58[remainder] + out; num /= 58n; }
  let leading = 0;
  while (leading < bytes.length && bytes[leading] === 0) leading += 1;
  return "1".repeat(leading) + (out || "");
}

export function assertSolanaAddress(value: string, field = "address"): string {
  const normalized = value?.trim();
  if (!normalized || normalized.length < 32 || normalized.length > 44) throw new SolanaDataError(400, "INVALID_SOLANA_ADDRESS", `${field} must be a Solana base58 public key.`);
  try {
    const decoded = decodeBase58(normalized);
    if (decoded.length !== 32) throw new Error("INVALID_LENGTH");
  } catch {
    throw new SolanaDataError(400, "INVALID_SOLANA_ADDRESS", `${field} must decode to exactly 32 bytes.`);
  }
  return normalized;
}

type RpcEndpoint = { url: string; provider: string; endpointId: string };
type RpcEndpointTelemetry = {
  endpointId: string;
  provider: string;
  state: "LIVE" | "DEGRADED" | "OPEN" | "UNKNOWN";
  consecutiveFailures: number;
  openUntil: number | null;
  lastCheckedAt: string | null;
  latencyMs: number | null;
  lastErrorCode: string | null;
};
const rpcEndpointTelemetry = new Map<string, RpcEndpointTelemetry>();
let lastRpcEndpointId: string | null = null;

function rpcEndpointId(url: string, index: number) { return `rpc-${index + 1}-${sha256Hex(url).slice(0, 12)}`; }
function rpcCircuitFailureThreshold() {
  const value = Number(process.env.RPC_CIRCUIT_FAILURE_THRESHOLD ?? 3);
  return Number.isInteger(value) && value >= 1 && value <= 20 ? value : 3;
}
function rpcCircuitCooldownMs() {
  const value = Number(process.env.RPC_CIRCUIT_COOLDOWN_MS ?? 30_000);
  return Number.isFinite(value) && value >= 1_000 && value <= 600_000 ? Math.floor(value) : 30_000;
}
function rpcMaxFailoverAttempts() {
  const value = Number(process.env.RPC_MAX_FAILOVER_ATTEMPTS ?? 3);
  return Number.isInteger(value) && value >= 1 && value <= 10 ? value : 3;
}
function rpcCandidates(): RpcEndpoint[] {
  const network = cluster();
  const urls: Array<{ url: string; provider: string }> = [];
  const explicit = process.env.SOLANA_RPC_URL?.trim();
  if (explicit) urls.push({ url: explicit, provider: process.env.SOLANA_RPC_PROVIDER?.trim() || "CONFIGURED_RPC" });
  const fallbacks = (process.env.SOLANA_RPC_FALLBACK_URLS ?? "").split(",").map(value => value.trim()).filter(Boolean);
  for (const [index, url] of fallbacks.entries()) urls.push({ url, provider: `CONFIGURED_RPC_FALLBACK_${index + 1}` });
  const heliusUrl = process.env.HELIUS_RPC_URL?.trim();
  if (heliusUrl && !urls.some(item => item.url === heliusUrl)) urls.push({ url: heliusUrl, provider: "HELIUS_RPC" });
  const key = process.env.HELIUS_API_KEY?.trim();
  if (key && network !== "testnet") {
    const host = network === "devnet" ? "https://devnet.helius-rpc.com" : "https://mainnet.helius-rpc.com";
    const url = `${host}/?api-key=${encodeURIComponent(key)}`;
    if (!urls.some(item => item.url === url)) urls.push({ url, provider: "HELIUS_RPC" });
  }
  if (!urls.length && allowDevFallback()) {
    if (network === "devnet") urls.push({ url: "https://api.devnet.solana.com", provider: "SOLANA_PUBLIC_DEVNET" });
    if (network === "testnet") urls.push({ url: "https://api.testnet.solana.com", provider: "SOLANA_PUBLIC_TESTNET" });
  }
  if (!urls.length) throw new SolanaDataError(503, "SOLANA_RPC_NOT_CONFIGURED", "A private/configured Solana RPC is required for this environment.");
  return urls.map((item, index) => ({ ...item, endpointId: rpcEndpointId(item.url, index) }));
}
function rpcConfig() {
  const first = rpcCandidates()[0];
  return { url: first.url, provider: first.provider };
}
function rpcEndpointSnapshot() {
  const now = Date.now();
  return rpcCandidates().map(endpoint => {
    const telemetry = rpcEndpointTelemetry.get(endpoint.endpointId);
    const open = Boolean(telemetry?.openUntil && telemetry.openUntil > now);
    return {
      endpointId: endpoint.endpointId,
      provider: endpoint.provider,
      active: endpoint.endpointId === lastRpcEndpointId,
      state: open ? "OPEN" : telemetry?.state ?? "UNKNOWN",
      consecutiveFailures: telemetry?.consecutiveFailures ?? 0,
      cooldownRemainingMs: open && telemetry?.openUntil ? Math.max(0, telemetry.openUntil - now) : 0,
      lastCheckedAt: telemetry?.lastCheckedAt ?? null,
      latencyMs: telemetry?.latencyMs ?? null,
      lastErrorCode: telemetry?.lastErrorCode ?? null,
    };
  });
}
function updateRpcEndpoint(endpoint: RpcEndpoint, ok: boolean, latencyMs: number, errorCode?: string) {
  const previous = rpcEndpointTelemetry.get(endpoint.endpointId);
  const failures = ok ? 0 : (previous?.consecutiveFailures ?? 0) + 1;
  const openUntil = !ok && failures >= rpcCircuitFailureThreshold() ? Date.now() + rpcCircuitCooldownMs() : null;
  rpcEndpointTelemetry.set(endpoint.endpointId, {
    endpointId: endpoint.endpointId, provider: endpoint.provider,
    state: ok ? "LIVE" : openUntil ? "OPEN" : "DEGRADED",
    consecutiveFailures: failures, openUntil, lastCheckedAt: nowIso(), latencyMs,
    lastErrorCode: ok ? null : errorCode ?? "RPC_UPSTREAM_ERROR",
  });
  if (ok) lastRpcEndpointId = endpoint.endpointId;
}

async function fetchJson<T>(url: string, init: RequestInit, timeoutMs = 7_500, provider = "UPSTREAM"): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) throw new SolanaDataError(502, "UPSTREAM_HTTP_ERROR", `Upstream returned HTTP ${response.status}.`, { status: response.status });
    const value = await response.json() as T;
    recordProviderTelemetry(provider, true, Date.now() - started);
    return value;
  } catch (error) {
    const code = error instanceof SolanaDataError ? error.code : error instanceof Error && error.name === "AbortError" ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE";
    recordProviderTelemetry(provider, false, Date.now() - started, code);
    if (error instanceof SolanaDataError) throw error;
    throw new SolanaDataError(503, code, error instanceof Error ? error.message : "Upstream request failed.");
  } finally { clearTimeout(timeout); }
}

async function rpcTransport<T>(payload: unknown): Promise<T> {
  const candidates = rpcCandidates();
  const now = Date.now();
  const available = candidates.filter(endpoint => (rpcEndpointTelemetry.get(endpoint.endpointId)?.openUntil ?? 0) <= now);
  const ordered = available.length ? available : candidates;
  const attempts = ordered.slice(0, Math.min(ordered.length, rpcMaxFailoverAttempts()));
  let lastError: unknown = null;
  const totalStarted = Date.now();
  for (const endpoint of attempts) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(process.env.SOLANA_RPC_TIMEOUT_MS ?? 7_500));
    const started = Date.now();
    try {
      const response = await fetch(endpoint.url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), signal: controller.signal });
      if (!response.ok) throw new SolanaDataError(502, "SOLANA_RPC_HTTP_ERROR", `RPC endpoint returned HTTP ${response.status}.`, { status: response.status });
      const value = await response.json() as T;
      updateRpcEndpoint(endpoint, true, Date.now() - started);
      recordProviderTelemetry("SOLANA_RPC", true, Date.now() - totalStarted);
      return value;
    } catch (error) {
      const code = error instanceof SolanaDataError ? error.code : error instanceof Error && error.name === "AbortError" ? "SOLANA_RPC_TIMEOUT" : "SOLANA_RPC_UNAVAILABLE";
      updateRpcEndpoint(endpoint, false, Date.now() - started, code);
      lastError = error;
    } finally { clearTimeout(timeout); }
  }
  const code = lastError instanceof SolanaDataError ? lastError.code : "SOLANA_RPC_UNAVAILABLE";
  recordProviderTelemetry("SOLANA_RPC", false, Date.now() - totalStarted, code);
  if (lastError instanceof SolanaDataError) throw lastError;
  throw new SolanaDataError(503, code, lastError instanceof Error ? lastError.message : "All configured Solana RPC endpoints failed.");
}

async function rpc<T>(method: string, params: unknown[] | Record<string, unknown> = []): Promise<T> {
  const body = await rpcTransport<JsonRpcResult<T>>({ jsonrpc: "2.0", id: method, method, params });
  if (body.error) throw new SolanaDataError(502, "SOLANA_RPC_ERROR", body.error.message, body.error);
  if (body.result === undefined) throw new SolanaDataError(502, "SOLANA_RPC_EMPTY_RESULT", `${method} returned no result.`);
  return body.result;
}

async function rpcBatch(calls: Array<{ method: string; params?: unknown[] | Record<string, unknown> }>) {
  const payload = calls.map((call, index) => ({ jsonrpc: "2.0", id: index + 1, method: call.method, params: call.params ?? [] }));
  const result = await rpcTransport<Array<JsonRpcResult<unknown>>>(payload);
  const byId = new Map(result.map(item => [Number(item.id), item]));
  return calls.map((call, index) => ({ method: call.method, result: byId.get(index + 1)?.result, error: byId.get(index + 1)?.error }));
}

export async function solanaRpcCall<T>(method: string, params: unknown[] | Record<string, unknown> = []): Promise<T> {
  const [call] = await rpcBatch([{ method, params }]);
  if (call?.error) {
    throw new SolanaDataError(502, "SOLANA_RPC_METHOD_ERROR", `Solana RPC method ${method} failed`, call.error);
  }
  return call?.result as T;
}


async function cached<T>(key: string, ttlMs: number, producer: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expiresAt > Date.now()) return hit.value;
  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;
  const task = producer().then(value => {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  }).finally(() => inflight.delete(key));
  inflight.set(key, task);
  return task;
}

function pythFeedMap() { return safeJson<Record<string, string>>(process.env.PYTH_MINT_FEED_MAP_JSON, {}); }
function marketProviderConfigured(provider: MarketProvider) {
  if (provider === "PYTH") return Boolean(process.env.PYTH_API_KEY?.trim() && Object.keys(pythFeedMap()).length);
  if (provider === "JUPITER_PRICE_V3" || provider === "JUPITER_TOKENS_V2") return Boolean(process.env.JUPITER_API_KEY?.trim() || process.env.JUPITER_ALLOW_KEYLESS === "true");
  if (provider === "COINGECKO") return Boolean(process.env.COINGECKO_API_KEY?.trim() || process.env.COINGECKO_ALLOW_KEYLESS === "true");
  if (provider === "COINMARKETCAP") return Boolean(process.env.COINMARKETCAP_API_KEY?.trim() || process.env.COINMARKETCAP_ALLOW_KEYLESS === "true");
  if (provider === "BIRDEYE") return Boolean(process.env.BIRDEYE_API_KEY?.trim());
  if (provider === "HELIUS_DAS") return heliusConfigured();
  return false;
}

function marketCapability(): SolanaOverview["capabilities"]["market"] {
  const configured: MarketProvider[] = ["PYTH", "JUPITER_PRICE_V3", "COINGECKO", "COINMARKETCAP", "BIRDEYE", "HELIUS_DAS"].filter(marketProviderConfigured);
  if (configured.length >= 2) return "MULTI_PROVIDER";
  if (marketProviderConfigured("JUPITER_PRICE_V3") && marketProviderConfigured("JUPITER_TOKENS_V2")) return "JUPITER_V3_PLUS_LIQUIDITY";
  if (marketProviderConfigured("JUPITER_PRICE_V3")) return "JUPITER_V3";
  if (configured.length === 1) return "FALLBACK_ONLY";
  return "UNAVAILABLE";
}

export async function getSolanaOverview(): Promise<SolanaOverview> {
  return cached(`overview:${cluster()}`, 5_000, async () => {
    const fetchedAt = nowIso(); const network = cluster(); const config = rpcConfig(); const started = Date.now();
    const calls = await rpcBatch([
      { method: "getHealth" },
      { method: "getSlot", params: [{ commitment: "confirmed" }] },
      { method: "getBlockHeight", params: [{ commitment: "confirmed" }] },
      { method: "getEpochInfo", params: [{ commitment: "confirmed" }] },
      { method: "getVersion" },
      { method: "getLatestBlockhash", params: [{ commitment: "confirmed" }] },
      { method: "getGenesisHash" },
      { method: "getSupply", params: [{ commitment: "confirmed" }] },
    ]);
    const latencyMs = Date.now() - started;
    const value = (name: string) => calls.find(item => item.method === name)?.result as any;
    const health = value("getHealth"); const epoch = value("getEpochInfo"); const version = value("getVersion");
    const latestBlockhash = value("getLatestBlockhash")?.value; const genesisHash = typeof value("getGenesisHash") === "string" ? value("getGenesisHash") : null;
    const supply = value("getSupply")?.value; const expectedGenesisHash = process.env.SOLANA_EXPECTED_GENESIS_HASH?.trim() || null;
    const clusterMismatch = Boolean(expectedGenesisHash && genesisHash && expectedGenesisHash !== genesisHash);
    const errors = calls.filter(item => item.error); const degraded = errors.length > 0 || clusterMismatch || health !== "ok";
    return {
      network, status: degraded ? "DEGRADED" : "LIVE",
      source: { provider: config.provider, state: degraded ? "DEGRADED" : "LIVE", fetchedAt, latencyMs },
      clusterVerification: { genesisHash, expectedGenesisHash, matchesExpected: expectedGenesisHash && genesisHash ? expectedGenesisHash === genesisHash : null },
      chain: {
        health: typeof health === "string" ? health : null,
        slot: toFiniteNumber(value("getSlot")), blockHeight: toFiniteNumber(value("getBlockHeight")),
        epoch: toFiniteNumber(epoch?.epoch), slotIndex: toFiniteNumber(epoch?.slotIndex), slotsInEpoch: toFiniteNumber(epoch?.slotsInEpoch),
        solanaCore: typeof version?.["solana-core"] === "string" ? version["solana-core"] : null,
        featureSet: toFiniteNumber(version?.["feature-set"]),
        blockhash: typeof latestBlockhash?.blockhash === "string" ? latestBlockhash.blockhash : null,
        lastValidBlockHeight: toFiniteNumber(latestBlockhash?.lastValidBlockHeight),
        totalSupplyLamports: supply?.total != null ? String(supply.total) : null,
        circulatingSupplyLamports: supply?.circulating != null ? String(supply.circulating) : null,
      },
      capabilities: { assets: heliusConfigured() ? "RPC_PLUS_METADATA" : "RPC_ONLY", market: marketCapability() },
    };
  });
}

type ProgramRegistryEntry = { slug: string; label: string; family?: string; programId?: string | null; required?: boolean };
const DEFAULT_PROGRAMS: Array<[string, string, string, string, boolean]> = [
  ["launchpad-registry", "Launchpad Registry", "POWERCHAIN_LAUNCHPAD", "SOLANA_LAUNCHPAD_REGISTRY_PROGRAM_ID", true],
  ["launch-policy", "Launch Policy", "POWERCHAIN_LAUNCHPAD", "SOLANA_LAUNCH_POLICY_PROGRAM_ID", true],
  ["token-factory", "Token Factory", "POWERCHAIN_LAUNCHPAD", "SOLANA_TOKEN_FACTORY_PROGRAM_ID", true],
  ["token-2022-vesting", "Token-2022 Vesting", "POWERCHAIN_LAUNCHPAD", "SOLANA_TOKEN_2022_VESTING_PROGRAM_ID", false],
  ["launchpad-escrow", "Launchpad Escrow", "POWERCHAIN_LAUNCHPAD", "SOLANA_LAUNCHPAD_ESCROW_PROGRAM_ID", false],
  ["crisis-fundings", "Crisis Funding", "POWERCHAIN_CRISIS", "SOLANA_FUNDINGS_PROGRAM_ID", false],
  ["stablecoin-policy", "Stablecoin Policy", "POWERCHAIN_CRISIS", "SOLANA_STABLECOIN_PROGRAM_ID", false],
  ["oracle-registry", "Oracle Registry", "POWERCHAIN_CRISIS", "SOLANA_ORACLES_PROGRAM_ID", false],
  ["supply-chain", "Supply Chain", "POWERCHAIN_CRISIS", "SOLANA_SUPPLY_CHAIN_PROGRAM_ID", false],
];

function programRegistry(): ProgramRegistryEntry[] {
  const launchpad = safeJson<ProgramRegistryEntry[]>(process.env.SOLANA_LAUNCHPAD_PROGRAM_REGISTRY_JSON, []);
  const custom = safeJson<ProgramRegistryEntry[]>(process.env.SOLANA_PROGRAM_REGISTRY_JSON, []);
  const defaults = DEFAULT_PROGRAMS.map(([slug, label, family, env, required]) => ({ slug, label, family, required, programId: process.env[env]?.trim() || null }));
  const source = [...defaults, ...launchpad, ...custom];
  const deduped = new Map<string, ProgramRegistryEntry>();
  for (const entry of source) deduped.set(entry.slug, { family: "POWERCHAIN", required: false, ...entry });
  return [...deduped.values()];
}

function loaderKind(owner: string | null): SolanaProgramInfo["loader"] {
  if (!owner) return null;
  if (owner === BPF_LOADER_UPGRADEABLE) return "BPF_LOADER_UPGRADEABLE";
  if (owner === LOADER_V4) return "LOADER_V4";
  if (owner === BPF_LOADER || owner === BPF_LOADER_2) return "BPF_LOADER";
  return "OTHER";
}

function base64AccountData(info: any): Buffer | null {
  if (!Array.isArray(info?.data) || typeof info.data[0] !== "string") return null;
  try { return Buffer.from(info.data[0], "base64"); } catch { return null; }
}
function upgradeableProgramDataAddress(info: any): string | null {
  const data = base64AccountData(info);
  if (!data || data.length < 36 || data.readUInt32LE(0) !== 2) return null;
  return encodeBase58(data.subarray(4, 36));
}
function parseUpgradeableProgramData(info: any) {
  const data = base64AccountData(info);
  if (!data || data.length < 13 || data.readUInt32LE(0) !== 3) return { lastDeploySlot: null, upgradeAuthority: null, fingerprint: null };
  const slot = data.length >= 12 ? Number(data.readBigUInt64LE(4)) : null;
  const option = data[12];
  const authority = option === 1 && data.length >= 45 ? encodeBase58(data.subarray(13,45)) : null;
  const codeOffset = option === 1 ? 45 : 13;
  const code = data.length > codeOffset ? data.subarray(codeOffset) : data;
  return { lastDeploySlot: slot != null && Number.isSafeInteger(slot) ? slot : null, upgradeAuthority: authority, fingerprint: sha256Hex(code) };
}

export async function getSolanaPrograms(): Promise<{ network: SolanaCluster; status: "LIVE" | "DEGRADED"; source: DataSourceMeta; verification: { configured: number; verified: number; requiredMissing: number }; programs: SolanaProgramInfo[] }> {
  const network = cluster(); const fetchedAt = nowIso(); const config = rpcConfig(); const registry = programRegistry();
  const configured = registry.filter(item => item.programId); const infos = new Map<string, any>();
  const valid: Array<{ item: ProgramRegistryEntry; id: string }> = [];
  for (const item of configured) {
    try { valid.push({ item, id: assertSolanaAddress(item.programId!, `${item.slug}.programId`) }); }
    catch (error) { infos.set(item.slug, error); }
  }
  for (let offset = 0; offset < valid.length; offset += 100) {
    const chunk = valid.slice(offset, offset + 100);
    try {
      const result = await rpc<any>("getMultipleAccounts", [chunk.map(entry => entry.id), { encoding: "base64", commitment: "confirmed" }]);
      const values = Array.isArray(result?.value) ? result.value : [];
      chunk.forEach((entry, index) => infos.set(entry.item.slug, values[index] ?? null));
    } catch (error) { chunk.forEach(entry => infos.set(entry.item.slug, error)); }
  }

  const programDataBySlug = new Map<string, any>();
  const upgradeable = valid.map(({item}) => ({ item, info: infos.get(item.slug) })).filter(({info}) => info && !(info instanceof Error) && loaderKind(typeof info.owner === "string" ? info.owner : null) === "BPF_LOADER_UPGRADEABLE").map(({item,info}) => ({ item, address: upgradeableProgramDataAddress(info) })).filter((entry): entry is { item: ProgramRegistryEntry; address: string } => Boolean(entry.address));
  for (let offset = 0; offset < upgradeable.length; offset += 100) {
    const chunk = upgradeable.slice(offset, offset + 100);
    try {
      const result = await rpc<any>("getMultipleAccounts", [chunk.map(entry => entry.address), { encoding: "base64", commitment: "confirmed" }]);
      const values = Array.isArray(result?.value) ? result.value : [];
      chunk.forEach((entry, index) => programDataBySlug.set(entry.item.slug, values[index] ?? null));
    } catch (error) { chunk.forEach(entry => programDataBySlug.set(entry.item.slug, error)); }
  }

  const programs: SolanaProgramInfo[] = registry.map(item => {
    const base = { slug: item.slug, label: item.label, family: item.family || "POWERCHAIN", required: Boolean(item.required) };
    const empty = { programDataAddress: null, lastDeploySlot: null, upgradeAuthority: null, deploymentFingerprintSha256: null };
    if (!item.programId) return { ...base, programId: null, state: "UNCONFIGURED", deploymentVerified: false, executable: null, owner: null, loader: null, lamports: null, dataLength: null, ...empty };
    const info = infos.get(item.slug);
    if (info instanceof Error) return { ...base, programId: item.programId, state: "INVALID_CONFIGURATION", deploymentVerified: false, executable: null, owner: null, loader: null, lamports: null, dataLength: null, ...empty };
    if (!info) return { ...base, programId: item.programId, state: "NOT_FOUND", deploymentVerified: false, executable: false, owner: null, loader: null, lamports: null, dataLength: null, ...empty };
    const owner = typeof info.owner === "string" ? info.owner : null; const executable = Boolean(info.executable); const loader = loaderKind(owner);
    const raw = base64AccountData(info); const dataLength = raw?.length ?? null;
    let programDataAddress: string | null = null; let lastDeploySlot: number | null = null; let upgradeAuthority: string | null = null; let fingerprint: string | null = null;
    if (loader === "BPF_LOADER_UPGRADEABLE") {
      programDataAddress = upgradeableProgramDataAddress(info);
      const programDataInfo = programDataBySlug.get(item.slug);
      if (programDataAddress && programDataInfo && !(programDataInfo instanceof Error)) {
        const parsed = parseUpgradeableProgramData(programDataInfo); lastDeploySlot = parsed.lastDeploySlot; upgradeAuthority = parsed.upgradeAuthority; fingerprint = parsed.fingerprint;
      }
    } else if (raw && raw.length) fingerprint = sha256Hex(raw);
    const deploymentVerified = executable && loader !== null && loader !== "OTHER" && Boolean(fingerprint);
    return { ...base, programId: item.programId, state: deploymentVerified ? "DEPLOYED" : "INVALID_CONFIGURATION", deploymentVerified, executable, owner, loader, lamports: info.lamports != null ? String(info.lamports) : null, dataLength, programDataAddress, lastDeploySlot, upgradeAuthority, deploymentFingerprintSha256: fingerprint };
  });
  const requiredMissing = programs.filter(program => program.required && !program.deploymentVerified).length;
  const degraded = requiredMissing > 0 || programs.some(program => program.programId && !program.deploymentVerified);
  return {
    network, status: degraded ? "DEGRADED" : "LIVE", source: { provider: config.provider, state: degraded ? "DEGRADED" : "LIVE", fetchedAt },
    verification: { configured: programs.filter(program => Boolean(program.programId)).length, verified: programs.filter(program => program.deploymentVerified).length, requiredMissing }, programs,
  };
}

function heliusConfigured() { return Boolean(process.env.HELIUS_RPC_URL?.trim() || process.env.HELIUS_API_KEY?.trim()); }
function heliusRpcUrl() {
  const explicit = process.env.HELIUS_RPC_URL?.trim();
  if (explicit) return explicit;
  const key = process.env.HELIUS_API_KEY?.trim();
  if (!key) throw new SolanaDataError(503, "HELIUS_DAS_NOT_CONFIGURED", "Helius DAS is not configured.");
  const network = cluster();
  if (network === "testnet") throw new SolanaDataError(503, "HELIUS_TESTNET_UNSUPPORTED", "Helius DAS is not configured for Solana testnet.");
  const host = network === "devnet" ? "https://devnet.helius-rpc.com" : "https://mainnet.helius-rpc.com";
  return `${host}/?api-key=${encodeURIComponent(key)}`;
}
async function heliusDas<T>(method: string, params: Record<string, unknown>): Promise<T> {
  const url = heliusRpcUrl();
  const body = await fetchJson<JsonRpcResult<T>>(url, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: `helius:${method}`, method, params }),
  }, 7_500, "HELIUS_DAS");
  if (body.error) throw new SolanaDataError(502, "HELIUS_DAS_ERROR", body.error.message, body.error);
  if (body.result === undefined) throw new SolanaDataError(502, "HELIUS_DAS_EMPTY_RESULT", `${method} returned no result.`);
  return body.result;
}

type JupiterPriceV3Record = { usdPrice?: number; blockId?: number; decimals?: number; priceChange24h?: number };
type JupiterTokenV2Record = { id?: string; address?: string; liquidity?: number; liquidityUsd?: number; decimals?: number; usdPrice?: number };
function jupiterHeaders() {
  const apiKey = process.env.JUPITER_API_KEY?.trim();
  if (apiKey) return { "x-api-key": apiKey, accept: "application/json" };
  if (process.env.JUPITER_ALLOW_KEYLESS === "true") return { accept: "application/json" };
  return null;
}
function jupiterBase() { return (process.env.JUPITER_API_BASE_URL?.trim() || "https://api.jup.ag").replace(/\/$/, ""); }
async function jupiterPriceV3Observation(mint: string): Promise<MarketObservation | null> {
  const headers = jupiterHeaders(); if (!headers) return null;
  try {
    const body = await fetchJson<Record<string, JupiterPriceV3Record>>(`${jupiterBase()}/price/v3?ids=${encodeURIComponent(mint)}`, { headers }, 7_500, "JUPITER_PRICE_V3");
    const item = body?.[mint]; const priceUsd = toFiniteNumber(item?.usdPrice); if (priceUsd == null || priceUsd <= 0) return null;
    return { provider: "JUPITER_PRICE_V3", priceUsd, change24hPct: toFiniteNumber(item?.priceChange24h) ?? undefined, priceBlockId: toFiniteNumber(item?.blockId) ?? undefined, decimals: toFiniteNumber(item?.decimals) ?? undefined, source: { provider: "JUPITER_PRICE_V3", state: "LIVE", fetchedAt: nowIso() } };
  } catch { return null; }
}
async function jupiterLiquidityUsd(mint: string): Promise<MarketObservation | null> {
  const headers = jupiterHeaders(); if (!headers || process.env.JUPITER_TOKENS_LIQUIDITY_ENABLED === "false") return null;
  try {
    const body = await fetchJson<JupiterTokenV2Record[] | { tokens?: JupiterTokenV2Record[] }>(`${jupiterBase()}/tokens/v2/search?query=${encodeURIComponent(mint)}`, { headers }, 7_500, "JUPITER_TOKENS_V2");
    const rows = Array.isArray(body) ? body : Array.isArray(body?.tokens) ? body.tokens : []; const item = rows.find(row => row.id === mint || row.address === mint) ?? rows[0]; if (!item) return null;
    const liquidityUsd = toFiniteNumber(item.liquidityUsd ?? item.liquidity); if (liquidityUsd == null) return null;
    return { provider: "JUPITER_TOKENS_V2", priceUsd: toFiniteNumber(item.usdPrice) ?? Number.NaN, liquidityUsd, decimals: toFiniteNumber(item.decimals) ?? undefined, source: { provider: "JUPITER_TOKENS_V2", state: "LIVE", fetchedAt: nowIso() } };
  } catch { return null; }
}

async function onChainTokenSupply(mint: string) {
  const fetchedAt = nowIso();
  const [supply, slot] = await Promise.all([rpc<any>("getTokenSupply", [mint, { commitment: "confirmed" }]), rpc<number>("getSlot", [{ commitment: "confirmed" }]).catch(() => null)]);
  const value = supply?.value; if (!value || value.amount == null || value.decimals == null) throw new SolanaDataError(404, "TOKEN_SUPPLY_UNAVAILABLE", "getTokenSupply returned no token supply for this mint.", { mint });
  const decimals = Number(value.decimals); if (!Number.isInteger(decimals) || decimals < 0 || decimals > 30) throw new SolanaDataError(502, "TOKEN_DECIMALS_INVALID", "Solana RPC returned invalid token decimals.", { mint, decimals: value.decimals });
  return { supplyAtomic: String(value.amount), uiAmountString: typeof value.uiAmountString === "string" ? value.uiAmountString : formatAtomic(String(value.amount), decimals), decimals, currentSlot: toFiniteNumber(slot), source: { provider: rpcConfig().provider, state: "LIVE" as const, fetchedAt } };
}

function pythObservation(mint: string): Promise<MarketObservation | null> {
  const feedId = pythFeedMap()[mint]; const apiKey = process.env.PYTH_API_KEY?.trim(); if (!feedId || !apiKey) return Promise.resolve(null);
  const base = (process.env.PYTH_HERMES_URL?.trim() || "https://pyth.dourolabs.app/hermes").replace(/\/$/, "");
  const url = `${base}/v2/updates/price/latest?ids%5B%5D=${encodeURIComponent(feedId)}`;
  return fetchJson<any>(url, { headers: { authorization: `Bearer ${apiKey}`, accept: "application/json" } }, 7_500, "PYTH").then(body => {
    const parsed = body?.parsed?.[0]; const price = parsed?.price; if (!price) return null; const raw = toFiniteNumber(price.price); const expo = toFiniteNumber(price.expo); if (raw == null || expo == null) return null;
    const priceUsd = raw * Math.pow(10, expo); if (!Number.isFinite(priceUsd) || priceUsd <= 0) return null;
    const confRaw = toFiniteNumber(price.conf); const publish = toFiniteNumber(price.publish_time); const publishedAt = publish ? new Date(publish * 1000).toISOString() : undefined; const freshnessSeconds = publish ? Math.max(0, Math.floor(Date.now() / 1000 - publish)) : undefined;
    return { provider: "PYTH" as const, priceUsd, confidenceUsd: confRaw != null ? confRaw * Math.pow(10, expo) : undefined, source: { provider: "PYTH_HERMES", state: freshnessSeconds != null && freshnessSeconds > Number(process.env.PYTH_MAX_AGE_SECONDS ?? 90) ? "DEGRADED" : "LIVE", fetchedAt: nowIso(), publishedAt, freshnessSeconds } };
  }).catch(() => null);
}

function coinGeckoObservation(mint: string): Promise<MarketObservation | null> {
  const key = process.env.COINGECKO_API_KEY?.trim(); const keyless = process.env.COINGECKO_ALLOW_KEYLESS === "true"; if (!key && !keyless) return Promise.resolve(null);
  const base = (process.env.COINGECKO_API_BASE_URL?.trim() || (key ? "https://pro-api.coingecko.com/api/v3" : "https://api.coingecko.com/api/v3")).replace(/\/$/, "");
  const query = new URLSearchParams({ contract_addresses: mint, vs_currencies: "usd", include_market_cap: "true", include_24hr_vol: "true", include_24hr_change: "true", include_last_updated_at: "true" });
  const headers: Record<string,string> = { accept: "application/json" }; if (key) headers["x-cg-pro-api-key"] = key;
  return fetchJson<Record<string, any>>(`${base}/simple/token_price/solana?${query}`, { headers }, 7_500, "COINGECKO").then(body => {
    const item = body?.[mint] ?? body?.[mint.toLowerCase()]; const priceUsd = toFiniteNumber(item?.usd); if (priceUsd == null || priceUsd <= 0) return null;
    const updated = toFiniteNumber(item?.last_updated_at); const freshnessSeconds = updated ? Math.max(0, Math.floor(Date.now()/1000 - updated)) : undefined; const maxAge = Number(process.env.COINGECKO_MAX_AGE_SECONDS ?? 120);
    return { provider: "COINGECKO" as const, priceUsd, change24hPct: toFiniteNumber(item?.usd_24h_change) ?? undefined, volume24hUsd: toFiniteNumber(item?.usd_24h_vol) ?? undefined, marketCapUsd: toFiniteNumber(item?.usd_market_cap) ?? undefined, source: { provider: "COINGECKO", state: freshnessSeconds != null && freshnessSeconds > maxAge ? "DEGRADED" : "LIVE", fetchedAt: nowIso(), publishedAt: updated ? new Date(updated*1000).toISOString() : undefined, freshnessSeconds } };
  }).catch(() => null);
}

function coinMarketCapObservation(mint: string): Promise<MarketObservation | null> {
  const key = process.env.COINMARKETCAP_API_KEY?.trim(); const keyless = process.env.COINMARKETCAP_ALLOW_KEYLESS === "true"; if (!key && !keyless) return Promise.resolve(null);
  const base = (process.env.COINMARKETCAP_API_BASE_URL?.trim() || "https://pro-api.coinmarketcap.com").replace(/\/$/, ""); const prefix = key ? "" : "/public-api";
  const headers: Record<string,string> = { accept: "application/json" }; if (key) headers["X-CMC_PRO_API_KEY"] = key;
  const query = new URLSearchParams({ platform: "solana", address: mint });
  return fetchJson<any>(`${base}${prefix}/v1/dex/token/price?${query}`, { headers }, 7_500, "COINMARKETCAP").then(item => {
    const priceUsd = toFiniteNumber(item?.p); if (priceUsd == null || priceUsd <= 0) return null; const ts = toFiniteNumber(item?.ts); const seconds = ts ? (ts > 1_000_000_000_000 ? Math.floor(ts/1000) : Math.floor(ts)) : undefined; const freshnessSeconds = seconds ? Math.max(0, Math.floor(Date.now()/1000 - seconds)) : undefined; const maxAge = Number(process.env.COINMARKETCAP_MAX_AGE_SECONDS ?? 180);
    return { provider: "COINMARKETCAP" as const, priceUsd, change24hPct: toFiniteNumber(item?.pc24h) ?? undefined, liquidityUsd: toFiniteNumber(item?.l) ?? undefined, volume24hUsd: toFiniteNumber(item?.v24h) ?? undefined, marketCapUsd: toFiniteNumber(item?.mc) ?? undefined, source: { provider: "COINMARKETCAP", state: freshnessSeconds != null && freshnessSeconds > maxAge ? "DEGRADED" : "LIVE", fetchedAt: nowIso(), publishedAt: seconds ? new Date(seconds*1000).toISOString() : undefined, freshnessSeconds } };
  }).catch(() => null);
}

function birdeyeObservation(mint: string): Promise<MarketObservation | null> {
  const apiKey = process.env.BIRDEYE_API_KEY?.trim(); if (!apiKey) return Promise.resolve(null); const base = (process.env.BIRDEYE_API_BASE_URL?.trim() || "https://public-api.birdeye.so").replace(/\/$/, "");
  return fetchJson<any>(`${base}/defi/price?address=${encodeURIComponent(mint)}`, { headers: { "X-API-KEY": apiKey, "x-chain": "solana", accept: "application/json" } }, 7_500, "BIRDEYE").then(body => {
    const data = body?.data; const priceUsd = toFiniteNumber(data?.value); if (priceUsd == null || priceUsd <= 0) return null;
    return { provider: "BIRDEYE" as const, priceUsd, change24hPct: toFiniteNumber(data?.priceChange24h) ?? undefined, liquidityUsd: toFiniteNumber(data?.liquidity) ?? undefined, source: { provider: "BIRDEYE", state: "LIVE", fetchedAt: nowIso() } };
  }).catch(() => null);
}
function heliusPriceObservation(mint: string): Promise<MarketObservation | null> {
  if (!heliusConfigured()) return Promise.resolve(null);
  return heliusDas<any>("getAsset", { id: mint, displayOptions: { showFungible: true } }).then(asset => {
    const priceUsd = toFiniteNumber(asset?.token_info?.price_info?.price_per_token); if (priceUsd == null || priceUsd <= 0) return null;
    return { provider: "HELIUS_DAS" as const, priceUsd, source: { provider: "HELIUS_DAS", state: "LIVE", fetchedAt: nowIso(), cached: true, ttlSeconds: 600 } };
  }).catch(() => null);
}

export function getProviderStatus() {
  const pythFeeds = Object.keys(pythFeedMap()).length;
  const maxAgeSeconds = telemetryMaxAgeSeconds();
  const definitions = [
    { provider: "SOLANA_RPC", configured: (() => { try { rpcConfig(); return true; } catch { return false; } })(), capability: "CLUSTER_AND_ONCHAIN", market: false },
    { provider: "HELIUS_DAS", configured: heliusConfigured(), capability: "TOKEN_METADATA_ENRICHMENT", market: false },
    { provider: "PYTH", configured: Boolean(process.env.PYTH_API_KEY?.trim() && pythFeeds > 0), capability: "MARKET_PRICE", market: true },
    { provider: "JUPITER_PRICE_V3", configured: marketProviderConfigured("JUPITER_PRICE_V3"), capability: "MARKET_PRICE_AND_24H_CHANGE", market: true },
    { provider: "JUPITER_TOKENS_V2", configured: marketProviderConfigured("JUPITER_TOKENS_V2"), capability: "LIQUIDITY_ENRICHMENT", market: false },
    { provider: "COINGECKO", configured: marketProviderConfigured("COINGECKO"), capability: "MARKET_CORROBORATION", market: true },
    { provider: "COINMARKETCAP", configured: marketProviderConfigured("COINMARKETCAP"), capability: "MARKET_CORROBORATION", market: true },
    { provider: "BIRDEYE", configured: marketProviderConfigured("BIRDEYE"), capability: "MARKET_CORROBORATION", market: true },
  ];
  const providers = definitions.map(definition => {
    const telemetry = providerTelemetry.get(definition.provider);
    const ageSeconds = telemetryAgeSeconds(telemetry?.lastCheckedAt);
    const stale = definition.configured && telemetry?.state === "LIVE" && ageSeconds != null && ageSeconds > maxAgeSeconds;
    return {
      provider: definition.provider, capability: definition.capability, market: definition.market, configured: definition.configured,
      state: !definition.configured ? "UNCONFIGURED" : stale ? "DEGRADED" : telemetry?.state ?? "UNKNOWN",
      fresh: Boolean(definition.configured && telemetry?.state === "LIVE" && ageSeconds != null && ageSeconds <= maxAgeSeconds),
      freshnessLimitSeconds: maxAgeSeconds, ageSeconds, lastCheckedAt: telemetry?.lastCheckedAt ?? null, latencyMs: telemetry?.latencyMs ?? null,
      consecutiveFailures: telemetry?.consecutiveFailures ?? 0, lastErrorCode: stale ? "TELEMETRY_STALE" : telemetry?.lastErrorCode ?? null,
    };
  });
  const configured = providers.filter(item => item.configured);
  const live = configured.filter(item => item.state === "LIVE" && item.fresh);
  const liveMarket = live.filter(item => item.market);
  const requiredQuorum = Math.max(1, Number(process.env.REQUIRED_PROVIDER_QUORUM ?? 1));
  const rawQuorumMet = liveMarket.length >= requiredQuorum;
  const failureHysteresis = Math.max(1, Math.min(20, Number(process.env.PROVIDER_QUORUM_FAILURE_HYSTERESIS ?? 2)));
  const recoveryHysteresis = Math.max(1, Math.min(20, Number(process.env.PROVIDER_QUORUM_RECOVERY_HYSTERESIS ?? 2)));
  if (!providerQuorumState.initialized) {
    providerQuorumState.initialized = true;
    providerQuorumState.effective = rawQuorumMet;
    providerQuorumState.consecutivePasses = rawQuorumMet ? 1 : 0;
    providerQuorumState.consecutiveFailures = rawQuorumMet ? 0 : 1;
  } else if (rawQuorumMet) {
    providerQuorumState.consecutivePasses += 1;
    providerQuorumState.consecutiveFailures = 0;
    if (!providerQuorumState.effective && providerQuorumState.consecutivePasses >= recoveryHysteresis) providerQuorumState.effective = true;
  } else {
    providerQuorumState.consecutiveFailures += 1;
    providerQuorumState.consecutivePasses = 0;
    if (providerQuorumState.effective && providerQuorumState.consecutiveFailures >= failureHysteresis) providerQuorumState.effective = false;
  }
  const status = configured.some(item => item.state === "DEGRADED") || !rawQuorumMet ? "DEGRADED" : configured.some(item => item.state === "UNKNOWN") ? "UNKNOWN" : configured.length ? "LIVE" : "UNCONFIGURED";
  return {
    network: cluster(), status,
    cache: { entries: cache.size, inFlight: inflight.size },
    rpc: {
      endpointCount: (() => { try { return rpcCandidates().length; } catch { return 0; } })(),
      activeEndpointId: lastRpcEndpointId,
      circuitFailureThreshold: rpcCircuitFailureThreshold(),
      circuitCooldownMs: rpcCircuitCooldownMs(),
      maxFailoverAttempts: rpcMaxFailoverAttempts(),
      endpoints: (() => { try { return rpcEndpointSnapshot(); } catch { return []; } })(),
    },
    summary: {
      configured: configured.length, live: live.length, liveMarketProviders: liveMarket.length, requiredQuorum,
      rawQuorumMet, quorumMet: providerQuorumState.effective,
      consecutiveQuorumPasses: providerQuorumState.consecutivePasses,
      consecutiveQuorumFailures: providerQuorumState.consecutiveFailures,
      failureHysteresis, recoveryHysteresis,
    },
    providers, fetchedAt: nowIso(),
  };
}

function providerPriority(): MarketProvider[] {
  const allowed = new Set<MarketProvider>(["PYTH","JUPITER_PRICE_V3","COINGECKO","COINMARKETCAP","BIRDEYE","HELIUS_DAS"]);
  const configured = (process.env.MARKET_PROVIDER_PRIORITY || "PYTH,JUPITER_PRICE_V3,COINGECKO,COINMARKETCAP,BIRDEYE,HELIUS_DAS").split(",").map(x => x.trim().toUpperCase()).filter(Boolean) as MarketProvider[];
  const valid = configured.filter(x => allowed.has(x)); return valid.length ? [...new Set(valid)] : ["PYTH","JUPITER_PRICE_V3","COINGECKO","COINMARKETCAP","BIRDEYE","HELIUS_DAS"];
}

export async function getSolanaMarket(mintInput: string): Promise<SolanaMarketResponse> {
  const mint = assertSolanaAddress(mintInput, "mint");
  return cached(`market:${cluster()}:${mint}`, 15_000, async () => {
    const fetchedAt = nowIso();
    const [onChain, jupiterPrice, jupiterLiquidity, pyth, coingecko, coinmarketcap, birdeye, helius] = await Promise.all([
      onChainTokenSupply(mint), jupiterPriceV3Observation(mint), jupiterLiquidityUsd(mint), pythObservation(mint), coinGeckoObservation(mint), coinMarketCapObservation(mint), birdeyeObservation(mint), heliusPriceObservation(mint),
    ]);
    const observations = [pyth, jupiterPrice, coingecko, coinmarketcap, birdeye, helius].filter((item): item is MarketObservation => Boolean(item));
    if (!observations.length) throw new SolanaDataError(503, "MARKET_DATA_UNAVAILABLE", "No configured market provider returned a valid price for this mint.", { mint });
    const priority = providerPriority();
    const selectable = observations.filter(item => priority.includes(item.provider));
    if (!selectable.length) throw new SolanaDataError(503, "MARKET_DATA_UNAVAILABLE", "Market providers returned observations, but none are enabled by MARKET_PROVIDER_PRIORITY.", { mint, availableProviders: observations.map(item => item.provider), providerPriority: priority });
    selectable.sort((a,b) => priority.indexOf(a.provider) - priority.indexOf(b.provider));
    const primary = selectable[0];
    let divergenceBps: number | undefined;
    if (observations.length > 1) { const min = Math.min(...observations.map(item => item.priceUsd)); const max = Math.max(...observations.map(item => item.priceUsd)); divergenceBps = Math.round(((max-min)/Math.max(min,Number.EPSILON))*10_000); }
    const maxDivergence = Number(process.env.PRICE_DIVERGENCE_BPS ?? DEFAULT_DIVERGENCE_BPS);
    const jupiter = observations.find(item => item.provider === "JUPITER_PRICE_V3"); const priceBlockId = jupiter?.priceBlockId ?? null; const blockLag = priceBlockId != null && onChain.currentSlot != null ? Math.max(0,onChain.currentSlot-priceBlockId) : null; const blockLagLimit = Math.max(1,Number(process.env.JUPITER_MAX_BLOCK_LAG ?? 150));
    const decimalMismatch = jupiter?.decimals != null && jupiter.decimals !== onChain.decimals;
    const liquidityCandidates = [jupiterLiquidity, primary, ...observations].filter((item): item is MarketObservation => Boolean(item?.liquidityUsd != null)); const liquidity = liquidityCandidates[0] ?? null;
    const change = primary.change24hPct ?? observations.find(item => item.change24hPct != null)?.change24hPct ?? null;
    const volume = primary.volume24hUsd ?? observations.find(item => item.volume24hUsd != null)?.volume24hUsd ?? null;
    const marketCap = primary.marketCapUsd ?? observations.find(item => item.marketCapUsd != null)?.marketCapUsd ?? null;
    const pythConfidenceBps = pyth?.confidenceUsd != null && pyth.priceUsd > 0 ? Math.round((pyth.confidenceUsd / pyth.priceUsd) * 10_000) : null;
    const pythConfidenceLimit = Math.max(1, Number(process.env.PYTH_MAX_CONFIDENCE_BPS ?? 200));
    const degraded = primary.source.state === "DEGRADED" || observations.some(item => item.source.state === "DEGRADED") || (divergenceBps != null && divergenceBps > maxDivergence) || (blockLag != null && blockLag > blockLagLimit) || decimalMismatch || (pythConfidenceBps != null && pythConfidenceBps > pythConfidenceLimit);
    const uiSupply = Number(onChain.uiAmountString); const fdv = Number.isFinite(uiSupply) && uiSupply >= 0 ? uiSupply * primary.priceUsd : null;
    return {
      mint, network: cluster(), status: degraded ? "DEGRADED" : "LIVE", onChain: { supplyAtomic: onChain.supplyAtomic, uiAmountString: onChain.uiAmountString, decimals: onChain.decimals, source: onChain.source },
      market: { priceUsd: primary.priceUsd, change24hPct: change, liquidityUsd: liquidity?.liquidityUsd ?? null, volume24hUsd: volume, marketCapUsd: marketCap, priceBlockId, currentSlot: onChain.currentSlot, blockLag, decimals: jupiter?.decimals ?? null, liquiditySource: liquidity?.provider ?? null },
      priceUsd: primary.priceUsd, primaryProvider: primary.provider, observations, divergenceBps,
      resolution: { strategy: "CONFIGURED_PRIORITY_WITH_DIVERGENCE_CHECK", providerPriority: priority, availableProviders: observations.map(item => item.provider), selectedProvider: primary.provider, maxDivergenceBps: maxDivergence, pythConfidenceBps, maxPythConfidenceBps: pythConfidenceLimit },
      derived: { fullyDilutedValueUsd: Number.isFinite(fdv ?? NaN) ? fdv : null }, use: "DISPLAY_AND_ANALYTICS_ONLY", fetchedAt,
    };
  });
}

function tokenProgramKind(owner: string | null): TokenProgramKind {
  if (owner === SPL_TOKEN_PROGRAM_ID) return "SPL_TOKEN"; if (owner === TOKEN_2022_PROGRAM_ID) return "TOKEN_2022"; return "UNKNOWN";
}
function baseMintAuthority(data: Buffer, offset: number): string | null {
  if (data.length < offset + 36) return null; const option = data.readUInt32LE(offset); if (option !== 1) return null; return encodeBase58(data.subarray(offset + 4, offset + 36));
}
function normalizedExtensions(info: any): SolanaAssetResponse["extensions"] {
  if (!Array.isArray(info?.extensions)) return [];
  return info.extensions.map((extension: any) => {
    const name = typeof extension?.extension === "string" ? extension.extension : typeof extension?.type === "string" ? extension.type : "UNKNOWN_EXTENSION";
    const details = extension?.state ?? extension;
    return { name, source: "RPC_JSON_PARSED" as const, details };
  });
}

export async function getSolanaAsset(mintInput: string): Promise<SolanaAssetResponse> {
  const mint = assertSolanaAddress(mintInput, "mint");
  return cached(`asset:${cluster()}:${mint}`, 30_000, async () => {
    const fetchedAt = nowIso();
    const [supply, rawAccount, parsedAccount] = await Promise.all([
      rpc<any>("getTokenSupply", [mint, { commitment: "confirmed" }]),
      rpc<any>("getAccountInfo", [mint, { encoding: "base64", commitment: "confirmed" }]),
      rpc<any>("getAccountInfo", [mint, { encoding: "jsonParsed", commitment: "confirmed" }]).catch(() => null),
    ]);
    if (!rawAccount?.value) throw new SolanaDataError(404, "SOLANA_ASSET_NOT_FOUND", "Mint account was not found on the configured Solana network.", { mint });
    const owner = typeof rawAccount.value.owner === "string" ? rawAccount.value.owner : null; const kind = tokenProgramKind(owner);
    if (kind === "UNKNOWN") throw new SolanaDataError(422, "UNSUPPORTED_TOKEN_PROGRAM", "Mint account is not owned by the SPL Token or Token-2022 program.", { mint, owner });
    const value = supply?.value ?? {}; const decimals = toFiniteNumber(value.decimals); const supplyAtomic = value.amount != null ? String(value.amount) : null;
    const base64 = Array.isArray(rawAccount.value.data) && typeof rawAccount.value.data[0] === "string" ? rawAccount.value.data[0] : null; const raw = base64 ? Buffer.from(base64,"base64") : Buffer.alloc(0);
    const parsedInfo = parsedAccount?.value?.data?.parsed?.info ?? null; const extensions = kind === "TOKEN_2022" ? normalizedExtensions(parsedInfo) : [];
    const mintAuthority = typeof parsedInfo?.mintAuthority === "string" ? parsedInfo.mintAuthority : baseMintAuthority(raw,0);
    const freezeAuthority = typeof parsedInfo?.freezeAuthority === "string" ? parsedInfo.freezeAuthority : baseMintAuthority(raw,46);
    const initialized = typeof parsedInfo?.isInitialized === "boolean" ? parsedInfo.isInitialized : raw.length > 45 ? raw[45] === 1 : null;
    const base: SolanaAssetResponse = {
      mint, network: cluster(), status: "LIVE", source: { provider: rpcConfig().provider, state: "LIVE", fetchedAt }, tokenProgram: owner, tokenProgramKind: kind, accountDataLength: raw.length || null,
      decimals, supplyAtomic, uiAmountString: typeof value.uiAmountString === "string" ? value.uiAmountString : decimals != null && supplyAtomic != null ? formatAtomic(supplyAtomic,decimals) : null,
      initialized, authorities: { mintAuthority, freezeAuthority }, extensions, extensionParsing: kind === "TOKEN_2022" && parsedInfo ? "RPC_JSON_PARSED" : "UNAVAILABLE",
      name: null, symbol: null, interface: null, metadataUri: null, image: null,
    };
    if (heliusConfigured()) {
      try {
        const asset = await heliusDas<any>("getAsset", { id: mint, displayOptions: { showFungible: true } }); const token = asset?.token_info ?? {};
        base.name = typeof asset?.content?.metadata?.name === "string" ? asset.content.metadata.name : null; base.symbol = typeof asset?.content?.metadata?.symbol === "string" ? asset.content.metadata.symbol : null;
        base.interface = typeof asset?.interface === "string" ? asset.interface : null; base.metadataUri = typeof asset?.content?.json_uri === "string" ? asset.content.json_uri : null; base.image = typeof asset?.content?.links?.image === "string" ? asset.content.links.image : null; base.priceUsd = toFiniteNumber(token?.price_info?.price_per_token) ?? undefined;
      } catch { /* Optional metadata enrichment only. */ }
    }
    return base;
  });
}

function formatAtomic(value: string, decimals: number) {
  const raw = BigInt(value); const negative = raw < 0n; const abs = negative ? -raw : raw; const base = 10n ** BigInt(decimals); const whole = abs / base; const fraction = (abs % base).toString().padStart(decimals,"0").replace(/0+$/,"");
  return `${negative?"-":""}${whole}${fraction?`.${fraction}`:""}`;
}
