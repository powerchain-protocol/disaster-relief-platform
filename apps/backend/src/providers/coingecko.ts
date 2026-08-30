import { providerFetch } from "./http.js";
export type CoinGeckoPriceSnapshot = {
  provider: "COINGECKO";
  priceUsd: number;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  change24hPct: number | null;
  reserveUsd: number | null;
};

export function coingeckoConfigured() {
  return Boolean(process.env.COINGECKO_API_KEY?.trim());
}

export async function fetchCoinGeckoPrice(mint: string): Promise<CoinGeckoPriceSnapshot> {
  const key = process.env.COINGECKO_API_KEY?.trim();
  if (!key) throw new Error("COINGECKO_API_KEY_NOT_CONFIGURED");
  const base = (process.env.COINGECKO_API_BASE_URL || "https://pro-api.coingecko.com/api/v3").replace(/\/$/, "");
  const address = encodeURIComponent(mint);
  const url = `${base}/onchain/simple/networks/solana/token_price/${address}?include_market_cap=true&include_24hr_vol=true&include_24hr_price_change=true&include_total_reserve_in_usd=true`;
  const response = await providerFetch("COINGECKO", url, {\n    headers: { accept: "application/json", "x-cg-pro-api-key": key },\n  }, Number(process.env.COINGECKO_TIMEOUT_MS ?? 7_500));
  const body = await response.json() as { data?: { attributes?: {
    token_prices?: Record<string,string>;
    market_cap_usd?: Record<string,string>;
    h24_volume_usd?: Record<string,string>;
    h24_price_change_percentage?: Record<string,string>;
    total_reserve_in_usd?: Record<string,string>;
  } } };
  const attrs = body.data?.attributes;
  const keyMatch = Object.keys(attrs?.token_prices || {}).find(k => k.toLowerCase() === mint.toLowerCase()) || mint;
  const price = Number(attrs?.token_prices?.[keyMatch]);
  if (!Number.isFinite(price)) throw new Error("COINGECKO_PRICE_UNAVAILABLE");
  const num = (record?: Record<string,string>) => {
    const value = Number(record?.[keyMatch]);
    return Number.isFinite(value) ? value : null;
  };
  return {
    provider: "COINGECKO",
    priceUsd: price,
    marketCapUsd: num(attrs?.market_cap_usd),
    volume24hUsd: num(attrs?.h24_volume_usd),
    change24hPct: num(attrs?.h24_price_change_percentage),
    reserveUsd: num(attrs?.total_reserve_in_usd),
  };
}
