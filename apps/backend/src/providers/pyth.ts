import { providerFetch } from "./http.js";
export type PythPriceSnapshot = {
  provider: "PYTH";
  priceUsd: number;
  confidenceUsd: number | null;
  publishTime: number;
  feedId: string;
};

export function pythConfigured() {
  return Boolean(process.env.PYTH_API_KEY?.trim() && process.env.PYTH_HERMES_URL?.trim());
}

export async function fetchPythPrice(feedId: string): Promise<PythPriceSnapshot> {
  const base = (process.env.PYTH_HERMES_URL || "https://pyth.dourolabs.app/hermes").replace(/\/$/, "");
  const key = process.env.PYTH_API_KEY?.trim();
  if (!key) throw new Error("PYTH_API_KEY_NOT_CONFIGURED");
  const url = `${base}/v2/updates/price/latest?ids%5B%5D=${encodeURIComponent(feedId)}&parsed=true`;
  const response = await providerFetch("PYTH", url, {\n    headers: { accept: "application/json", authorization: `Bearer ${key}` },\n  }, Number(process.env.PYTH_TIMEOUT_MS ?? 7_500));
  const body = await response.json() as { parsed?: Array<{ id?: string; price?: { price?: string; conf?: string; expo?: number; publish_time?: number } }> };
  const row = body.parsed?.[0];
  const p = row?.price;
  if (!p?.price || p.expo == null || p.publish_time == null) throw new Error("PYTH_PRICE_UNAVAILABLE");
  const multiplier = 10 ** p.expo;
  return {
    provider: "PYTH",
    priceUsd: Number(p.price) * multiplier,
    confidenceUsd: p.conf ? Number(p.conf) * multiplier : null,
    publishTime: p.publish_time,
    feedId: row?.id || feedId,
  };
}
