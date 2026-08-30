export class HeliusProviderError extends Error {
  constructor(public readonly code: string, message: string, public readonly status?: number) {
    super(message);
    this.name = "HeliusProviderError";
  }
}

function cluster() {
  const value = (process.env.SOLANA_NETWORK || "devnet").trim();
  return value === "mainnet-beta" ? "mainnet-beta" : value === "testnet" ? "testnet" : "devnet";
}

export function heliusConfigured() {
  return Boolean(process.env.HELIUS_API_KEY?.trim() || process.env.HELIUS_RPC_URL?.trim());
}

export function heliusEndpoint() {
  const explicit = process.env.HELIUS_RPC_URL?.trim();
  if (explicit) return explicit;
  const key = process.env.HELIUS_API_KEY?.trim();
  if (!key) return null;
  if (cluster() === "testnet") return null;
  const host = cluster() === "devnet" ? "https://devnet.helius-rpc.com" : "https://mainnet.helius-rpc.com";
  return `${host}/?api-key=${encodeURIComponent(key)}`;
}

export async function heliusRpc<T>(method: string, params: unknown) {
  const endpoint = heliusEndpoint();
  if (!endpoint) throw new HeliusProviderError("HELIUS_NOT_CONFIGURED", "Helius RPC/DAS is not configured");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.HELIUS_TIMEOUT_MS ?? 7500));
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: "powerchain-relief", method, params }),
      signal: controller.signal,
      cache: "no-store",
    });
    const body = await response.json().catch(() => null) as { result?: T; error?: { code?: number; message?: string } } | null;
    if (!response.ok) throw new HeliusProviderError("HELIUS_HTTP_ERROR", `Helius returned HTTP ${response.status}`, response.status);
    if (!body || body.error) throw new HeliusProviderError("HELIUS_RPC_ERROR", body?.error?.message || "Helius RPC error");
    return body.result as T;
  } finally {
    clearTimeout(timeout);
  }
}

export type HeliusAssetsByOwnerResult = {
  last_indexed_slot?: number;
  total?: number;
  items?: Array<{
    id?: string;
    interface?: string;
    content?: {
      metadata?: { name?: string; symbol?: string };
      links?: { image?: string };
      files?: Array<{ uri?: string; cdn_uri?: string }>;
    };
    token_info?: {
      symbol?: string;
      balance?: number | string;
      decimals?: number;
      price_info?: { price_per_token?: number; total_price?: number };
    };
    ownership?: { owner?: string };
    authorities?: Array<{ address?: string }>;
  }>;
};

export async function getAssetsByOwner(ownerAddress: string, page = 1, limit = 100) {
  return heliusRpc<HeliusAssetsByOwnerResult>("getAssetsByOwner", {
    ownerAddress,
    page,
    limit,
    displayOptions: {
      showFungible: true,
      showNativeBalance: false,
      showInscription: false,
      showCollectionMetadata: false,
    },
  });
}
