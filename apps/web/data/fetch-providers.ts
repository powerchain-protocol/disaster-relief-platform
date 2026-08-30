import { powerChainApi } from "../lib/api";

export async function fetchProviderHealth() {
  return powerChainApi.providerStatus();
}

export async function fetchSolanaPrograms() {
  return powerChainApi.solanaPrograms();
}

export async function fetchSolanaMarket(mint: string) {
  return powerChainApi.solanaMarket(mint);
}

export async function fetchSolanaAsset(mint: string) {
  return powerChainApi.solanaAsset(mint);
}
