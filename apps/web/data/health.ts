import { powerChainApi } from "../lib/api";

export async function fetchHealthBundle() {
  const results = await Promise.allSettled([
    powerChainApi.health(),
    powerChainApi.ready(),
    powerChainApi.providerStatus(),
    powerChainApi.sloStatus(),
  ]);
  const value = <T,>(index: number): T | null => results[index].status === "fulfilled" ? (results[index] as PromiseFulfilledResult<T>).value : null;
  return {
    health: value<Awaited<ReturnType<typeof powerChainApi.health>>>(0),
    ready: value<Awaited<ReturnType<typeof powerChainApi.ready>>>(1),
    providers: value<Awaited<ReturnType<typeof powerChainApi.providerStatus>>>(2),
    slo: value<Awaited<ReturnType<typeof powerChainApi.sloStatus>>>(3),
    partial: results.some(item => item.status === "rejected"),
    fetchedAt: new Date().toISOString(),
  };
}
