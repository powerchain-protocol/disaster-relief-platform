import { powerChainApi } from "../lib/api";
export async function fetchDashboardSnapshot() {
  const [overview, providers, programs, slo] = await Promise.all([
    powerChainApi.solanaOverview(),
    powerChainApi.providerStatus(),
    powerChainApi.solanaPrograms(),
    powerChainApi.sloStatus(),
  ]);
  return { overview, providers, programs, slo, fetchedAt: new Date().toISOString() };
}
