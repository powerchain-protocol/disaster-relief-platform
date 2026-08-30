import type { WalletPortfolioResponse } from "@powerchain/crisis-api-client";
import { powerChainApi } from "../lib/api";
import { validateSolanaAddress } from "../components/validate";

export async function fetchWalletPortfolio(address: string): Promise<WalletPortfolioResponse> {
  const validation = validateSolanaAddress(address);
  if (!validation.valid) throw new Error(validation.message);
  return powerChainApi.walletPortfolio(address.trim());
}

export function walletPortfolioTotalUsd(portfolio: WalletPortfolioResponse | null) {
  if (!portfolio) return null;
  const values = portfolio.assets.items.map(item => item.valueUsd).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
}
