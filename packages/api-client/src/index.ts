import type { SolanaAssetResponse, SolanaMarketResponse, SolanaOverview, SolanaProgramInfo, WalletPortfolioResponse } from "@powerchain/crisis-api-contract";

export type PowerChainPublicConfig = {
  version: "1.0.0";
  network: string;
  pwrcMint: string | null;
  providers: Record<string, boolean>;
  features: { solana: true; compatibilityAliases: true; websiteOriginProxy: true; realtime: boolean };
};


export type PowerChainProviderStatus = {
  network: string;
  status: "LIVE" | "DEGRADED" | "UNKNOWN" | "UNCONFIGURED";
  cache: { entries: number; inFlight: number };
  summary: { configured: number; live: number; liveMarketProviders: number; requiredQuorum: number; rawQuorumMet: boolean; quorumMet: boolean; consecutiveQuorumPasses: number; consecutiveQuorumFailures: number; failureHysteresis: number; recoveryHysteresis: number };
  rpc: { endpointCount: number; activeEndpointId: string | null; circuitFailureThreshold: number; circuitCooldownMs: number; maxFailoverAttempts: number; endpoints: Array<{ endpointId: string; provider: string; active: boolean; state: string; consecutiveFailures: number; cooldownRemainingMs: number; lastCheckedAt: string | null; latencyMs: number | null; lastErrorCode: string | null }> };
  providers: Array<{
    provider: string; capability: string; market: boolean; configured: boolean;
    state: "LIVE" | "DEGRADED" | "UNCONFIGURED" | "UNKNOWN"; fresh: boolean; freshnessLimitSeconds: number; ageSeconds: number | null;
    lastCheckedAt: string | null; latencyMs: number | null; consecutiveFailures: number; lastErrorCode: string | null;
  }>;
  fetchedAt: string;
};


export type PowerChainSloStatus = {
  schemaVersion: "1.0.0"; windowSeconds: number; sampleCount: number; minimumSamples: number; evaluable: boolean;
  availabilityPct: number | null; availabilityTargetPct: number; p95LatencyMs: number | null; p95TargetMs: number;
  availabilityOk: boolean | null; latencyOk: boolean | null; ok: boolean | null; windowStartedAt: string | null; fetchedAt: string;
};

export type PowerChainReady = {
  ready: boolean;
  status: "READY" | "DEGRADED" | "NOT_READY";
  strict?: boolean;
  network: string;
  intendedNetwork?: string;
  cluster?: { genesisHash: string | null; expectedGenesisHash: string | null; matchesExpected: boolean | null };
  checks: {
    rpc?: { ok: boolean; detail?: string };
    cluster?: { ok: boolean; detail?: string };
    programs?: { ok: boolean; detail?: string };
    providers?: { ok: boolean; detail?: string };
    providerQuorum?: { ok: boolean; detail?: string };
    market?: { required: boolean; ok: boolean; detail?: string };
    slo?: { required: boolean; ok: boolean; detail?: string };
    [key: string]: { ok: boolean; detail?: string; required?: boolean } | undefined;
  };
};

type FetchLike = typeof fetch;

export class PowerChainApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string, public readonly details?: unknown) {
    super(message); this.name = "PowerChainApiError";
  }
}

export class PowerChainApiClient {
  constructor(private readonly baseUrl = "", private readonly fetcher: FetchLike = fetch) {}
  private url(path: string) { return `${this.baseUrl.replace(/\/$/, "")}${path}`; }
  private async get<T>(path: string): Promise<T> {
    const response = await this.fetcher(this.url(path), { method: "GET", headers: { accept: "application/json" }, cache: "no-store" });
    const body = await response.json().catch(() => ({})) as any;
    if (!response.ok) throw new PowerChainApiError(response.status, body?.code ?? "HTTP_ERROR", body?.message ?? `HTTP ${response.status}`, body?.details);
    return body as T;
  }
  health() { return this.get<{ status: "ok"; version: "1.0.0"; uptimeSeconds: number }>("/api/v1/health"); }
  ready() { return this.get<PowerChainReady>("/api/v1/ready"); }
  publicConfig() { return this.get<PowerChainPublicConfig>("/api/v1/config/public"); }
  providerStatus() { return this.get<PowerChainProviderStatus>("/api/v1/providers/status"); }
  sloStatus() { return this.get<PowerChainSloStatus>("/api/v1/observability/slo"); }
  solanaOverview() { return this.get<SolanaOverview>("/api/v1/solana/overview"); }
  solanaPrograms() { return this.get<{ network: string; status: string; verification: { configured: number; verified: number; requiredMissing: number }; programs: SolanaProgramInfo[] }>("/api/v1/solana/programs"); }
  solanaMarket(mint: string) { return this.get<SolanaMarketResponse>(`/api/v1/solana/market?mint=${encodeURIComponent(mint)}`); }
  solanaAsset(mint: string) { return this.get<SolanaAssetResponse>(`/api/v1/solana/assets/${encodeURIComponent(mint)}`); }
  walletPortfolio(address: string) { return this.get<WalletPortfolioResponse>(`/api/v1/wallet/${encodeURIComponent(address)}/portfolio`); }
  compatibilityOverview() { return this.get<SolanaOverview>("/api/solana/overview"); }
  compatibilityTokenMarket(mint?: string) { return this.get<SolanaMarketResponse>(`/api/token/market${mint ? `?mint=${encodeURIComponent(mint)}` : ""}`); }
  compatibilityAsset(mint: string) { return this.get<SolanaAssetResponse>(`/api/assets/${encodeURIComponent(mint)}`); }
}

export type { SolanaAssetResponse, SolanaMarketResponse, SolanaOverview, SolanaProgramInfo, WalletPortfolioResponse } from "@powerchain/crisis-api-contract";
