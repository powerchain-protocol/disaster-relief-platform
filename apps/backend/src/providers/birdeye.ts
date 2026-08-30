import { providerFetch } from "./http.js";
export type BirdeyePriceSnapshot = {
  provider: "BIRDEYE";
  priceUsd: number;
  liquidityUsd: number | null;
  updatedAt: number | null;
};

export function birdeyeConfigured() {
  return Boolean(process.env.BIRDEYE_API_KEY?.trim());
}

export async function fetchBirdeyePrice(mint: string): Promise<BirdeyePriceSnapshot> {
  const key = process.env.BIRDEYE_API_KEY?.trim();
  if (!key) throw new Error("BIRDEYE_API_KEY_NOT_CONFIGURED");
  const base = (process.env.BIRDEYE_API_BASE_URL || "https://public-api.birdeye.so").replace(/\/$/, "");
  const url = `${base}/defi/price?address=${encodeURIComponent(mint)}&include_liquidity=true`;
  const response = await providerFetch("BIRDEYE", url, {\n    headers: { accept: "application/json", "X-API-KEY": key, "x-chain": "solana" },\n  }, Number(process.env.BIRDEYE_TIMEOUT_MS ?? 7_500));
  const body = await response.json() as { success?: boolean; data?: { value?: number; liquidity?: number; updateUnixTime?: number } | null };
  const price = body.data?.value;
  if (!body.success || typeof price !== "number" || !Number.isFinite(price)) throw new Error("BIRDEYE_PRICE_UNAVAILABLE");
  return {
    provider: "BIRDEYE",
    priceUsd: price,
    liquidityUsd: typeof body.data?.liquidity === "number" ? body.data.liquidity : null,
    updatedAt: typeof body.data?.updateUnixTime === "number" ? body.data.updateUnixTime : null,
  };
}
