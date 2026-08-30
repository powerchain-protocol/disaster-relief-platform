import "server-only";

const HOP_BY_HOP = new Set(["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade"]);
const RESPONSE_HEADERS = ["content-type", "deprecation", "link", "x-request-id", "x-powerchain-version", "x-powerchain-contract-version", "retry-after"];

function backendBaseUrl() {
  const value = process.env.POWERCHAIN_API_URL?.trim();
  if (!value) return null;
  try { return new URL(value.endsWith("/") ? value : `${value}/`); } catch { return null; }
}

export async function proxyPowerChainGet(request: Request, backendPath: string) {
  if (!backendPath.startsWith("/api/")) return Response.json({ code: "INVALID_PROXY_PATH" }, { status: 500 });
  const base = backendBaseUrl();
  if (!base) return Response.json({ code: "POWERCHAIN_API_URL_REQUIRED", message: "The website server is not configured with the PowerChain API origin." }, { status: 503, headers: { "cache-control": "no-store" } });

  const incoming = new URL(request.url);
  const target = new URL(backendPath.replace(/^\//, ""), base);
  for (const [key, value] of incoming.searchParams) target.searchParams.append(key, value);
  if (target.origin === incoming.origin) return Response.json({ code: "POWERCHAIN_API_PROXY_LOOP", message: "POWERCHAIN_API_URL must point to the backend origin, not the website origin." }, { status: 500, headers: { "cache-control": "no-store" } });

  const headers = new Headers({ accept: "application/json" });
  const requestId = request.headers.get("x-request-id");
  if (requestId) headers.set("x-request-id", requestId);
  const authorization = request.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);
  const internalToken = process.env.POWERCHAIN_INTERNAL_API_TOKEN?.trim();
  if (internalToken) headers.set("x-powerchain-internal-token", internalToken);

  let upstream: Response;
  try {
    upstream = await fetch(target, { method: "GET", headers, cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(10_000) });
  } catch (error) {
    return Response.json({ code: "POWERCHAIN_API_UNAVAILABLE", message: error instanceof Error ? error.message : "Backend request failed." }, { status: 503, headers: { "cache-control": "no-store" } });
  }

  const responseHeaders = new Headers({ "cache-control": "no-store" });
  for (const header of RESPONSE_HEADERS) {
    const value = upstream.headers.get(header);
    if (value && !HOP_BY_HOP.has(header)) responseHeaders.set(header, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}
