import type { WalletAssetItem, WalletPortfolioResponse } from "@powerchain/crisis-api-contract";
import { getAssetsByOwner, heliusConfigured } from "../providers/helius.js";
import { solanaRpcCall } from "./solana-data.js";
import { requireSolanaAddress } from "./validation.js";

function network(): "mainnet-beta" | "devnet" | "testnet" {
  const value = (process.env.SOLANA_NETWORK || "devnet").trim();
  return value === "mainnet-beta" ? "mainnet-beta" : value === "testnet" ? "testnet" : "devnet";
}
const now = () => new Date().toISOString();

function safeNumber(value: unknown) {
  const n = typeof value === "string" || typeof value === "number" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

export async function getWalletPortfolio(input: string): Promise<WalletPortfolioResponse> {
  const address = requireSolanaAddress(input, "wallet address");
  const fetchedAt = now();

  let lamports: string | null = null;
  try {
    const balance = await solanaRpcCall<{ value?: number }>("getBalance", [address, { commitment: "confirmed" }]);
    lamports = typeof balance?.value === "number" ? String(balance.value) : null;
  } catch {
    lamports = null;
  }

  const nativeSource = {
    provider: "SOLANA_RPC",
    state: lamports == null ? "UNAVAILABLE" as const : "LIVE" as const,
    fetchedAt,
  };

  if (!heliusConfigured()) {
    return {
      address,
      network: network(),
      status: lamports == null ? "UNAVAILABLE" : "DEGRADED",
      fetchedAt,
      native: { lamports, sol: lamports == null ? null : Number(lamports) / 1_000_000_000, source: nativeSource },
      assets: {
        provider: "HELIUS_DAS",
        state: "UNCONFIGURED",
        lastIndexedSlot: null,
        total: 0,
        items: [],
        source: { provider: "HELIUS_DAS", state: "UNCONFIGURED", fetchedAt },
      },
    };
  }

  try {
    const result = await getAssetsByOwner(address, 1, 250);
    const items: WalletAssetItem[] = (result.items || []).map(item => {
      const balanceAtomic = item.token_info?.balance == null ? null : String(item.token_info.balance);
      const decimals = typeof item.token_info?.decimals === "number" ? item.token_info.decimals : null;
      const uiAmount = balanceAtomic != null && decimals != null ? safeNumber(balanceAtomic) / (10 ** decimals) : null;
      const priceUsd = safeNumber(item.token_info?.price_info?.price_per_token);
      const totalPrice = safeNumber(item.token_info?.price_info?.total_price);
      return {
        id: item.id || "",
        interface: item.interface || null,
        name: item.content?.metadata?.name || null,
        symbol: item.token_info?.symbol || item.content?.metadata?.symbol || null,
        image: item.content?.links?.image || item.content?.files?.[0]?.cdn_uri || item.content?.files?.[0]?.uri || null,
        tokenProgram: null,
        balanceAtomic,
        decimals,
        uiAmount,
        priceUsd,
        valueUsd: totalPrice ?? (uiAmount != null && priceUsd != null ? uiAmount * priceUsd : null),
      };
    });
    const state = "LIVE" as const;
    return {
      address,
      network: network(),
      status: lamports == null ? "DEGRADED" : "LIVE",
      fetchedAt,
      native: { lamports, sol: lamports == null ? null : Number(lamports) / 1_000_000_000, source: nativeSource },
      assets: {
        provider: "HELIUS_DAS",
        state,
        lastIndexedSlot: typeof result.last_indexed_slot === "number" ? result.last_indexed_slot : null,
        total: typeof result.total === "number" ? result.total : items.length,
        items,
        source: { provider: "HELIUS_DAS", state, fetchedAt },
      },
    };
  } catch {
    return {
      address,
      network: network(),
      status: lamports == null ? "UNAVAILABLE" : "DEGRADED",
      fetchedAt,
      native: { lamports, sol: lamports == null ? null : Number(lamports) / 1_000_000_000, source: nativeSource },
      assets: {
        provider: "HELIUS_DAS",
        state: "UNAVAILABLE",
        lastIndexedSlot: null,
        total: 0,
        items: [],
        source: { provider: "HELIUS_DAS", state: "UNAVAILABLE", fetchedAt },
      },
    };
  }
}
