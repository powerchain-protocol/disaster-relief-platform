import { proxyPowerChainGet } from "../../../../../lib/server/powerchain-api-proxy";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET(request: Request) { return proxyPowerChainGet(request, "/api/v1/observability/slo"); }
