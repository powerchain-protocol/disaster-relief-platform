import { proxyPowerChainGet } from "../../../../lib/server/powerchain-api-proxy";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET(request: Request, context: { params: Promise<{ mint: string }> }) {
  const { mint } = await context.params;
  return proxyPowerChainGet(request, "/api/assets/" + encodeURIComponent(mint));
}
