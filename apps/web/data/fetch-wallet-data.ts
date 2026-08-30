import type { WalletPortfolioResponse } from "@powerchain/crisis-api-client";
import { powerChainApi } from "../lib/api";

export async function fetchWalletPortfolio(address: string): Promise<WalletPortfolioResponse> {
  return powerChainApi.walletPortfolio(address);
}
