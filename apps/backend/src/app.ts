import { timingSafeEqual } from "node:crypto";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import websocket from "@fastify/websocket";
import Fastify, { LogController, type FastifyInstance } from "fastify";
import { registerPowerChainSolanaApi } from "./api/register.js";
import { getProviderStatus, getSolanaMarket, getSolanaOverview, getSolanaPrograms, SolanaDataError } from "./services/solana-data.js";
import { getSloSnapshot, recordHttpSample } from "./runtime-metrics.js";

const VERSION = "1.0.0" as const;
const startedAt = Date.now();
const requestStartedAt = new WeakMap<object, number>();

function parseOrigins() {
  return (process.env.CORS_ORIGINS ?? "").split(",").map(value => value.trim()).filter(Boolean);
}
function providerFlags() {
  let pythFeeds = 0;
  try { pythFeeds = Object.keys(JSON.parse(process.env.PYTH_MINT_FEED_MAP_JSON || "{}") as Record<string, unknown>).length; } catch { pythFeeds = 0; }
  return {
    rpc: Boolean(process.env.SOLANA_RPC_URL?.trim() || process.env.HELIUS_RPC_URL?.trim() || process.env.HELIUS_API_KEY?.trim()),
    helius: Boolean(process.env.HELIUS_API_KEY?.trim() || process.env.HELIUS_RPC_URL?.trim()),
    pyth: Boolean(process.env.PYTH_API_KEY?.trim() && pythFeeds > 0),
    jupiter: Boolean(process.env.JUPITER_API_KEY?.trim() || process.env.JUPITER_ALLOW_KEYLESS === "true"),
    coingecko: Boolean(process.env.COINGECKO_API_KEY?.trim() || process.env.COINGECKO_ALLOW_KEYLESS === "true"),
    coinmarketcap: Boolean(process.env.COINMARKETCAP_API_KEY?.trim() || process.env.COINMARKETCAP_ALLOW_KEYLESS === "true"),
    birdeye: Boolean(process.env.BIRDEYE_API_KEY?.trim()),
  };
}
function publicNetwork() { return process.env.SOLANA_NETWORK?.trim() || "mainnet-beta"; }
function expectedProgramFingerprints() {
  try { return JSON.parse(process.env.EXPECTED_PROGRAM_FINGERPRINTS_JSON || "{}") as Record<string,string>; }
  catch { return {} as Record<string,string>; }
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL?.trim() || "info", redact: ["req.headers.authorization", "req.headers.x-powerchain-internal-token"] },
    bodyLimit: 1024 * 1024,
    requestIdHeader: "x-request-id",
    logController: new LogController({
      disableRequestLogging: (request) => process.env.NODE_ENV === "test" || request.url === "/api/v1/health",
      requestIdLogLabel: "requestId",
    }),
  });

  await app.register(helmet, { global: true, contentSecurityPolicy: false });
  const origins = parseOrigins();
  await app.register(cors, {
    origin: origins.length ? origins : false,
    credentials: true,
    methods: ["GET", "HEAD", "OPTIONS"],
  });
  await app.register(rateLimit, { global: true, max: Number(process.env.API_RATE_LIMIT_PER_MINUTE ?? 180), timeWindow: "1 minute" });
  await app.register(swagger, {
    openapi: {
      info: { title: "PowerChain Disaster Relief API", version: VERSION, description: "PowerChain Relief Network API for crisis capital, evidence and Solana operational intelligence." },
      servers: [{ url: "/", description: "Current origin" }],
      tags: [{ name: "System" }, { name: "Solana" }, { name: "Wallet" }, { name: "Capital" }],
    },
  });
  await app.register(swaggerUi, { routePrefix: "/api/swagger", uiConfig: { persistAuthorization: false, docExpansion: "list" } });
  await app.register(websocket, { options: { maxPayload: 8 * 1024 } });

  app.addHook("onRequest", async (request) => { requestStartedAt.set(request, Date.now()); });

  app.addHook("onRequest", async (request, reply) => {
    const configured = process.env.POWERCHAIN_INTERNAL_API_TOKEN?.trim();
    const protectedPath = request.url.startsWith("/api/v1/solana/") || request.url.startsWith("/api/solana/") || request.url.startsWith("/api/token/") || request.url.startsWith("/api/assets/");
    if (!configured || !protectedPath) return;
    const supplied = String(request.headers["x-powerchain-internal-token"] ?? "");
    const a = Buffer.from(configured); const b = Buffer.from(supplied);
    const valid = a.length === b.length && timingSafeEqual(a, b);
    if (!valid) return reply.code(401).send({ code: "BACKEND_ORIGIN_AUTH_REQUIRED", message: "Use the authorized website/API gateway origin." });
  });

  app.addHook("onResponse", async (request, reply) => {
    const started = requestStartedAt.get(request) ?? Date.now();
    recordHttpSample(request.url, reply.statusCode, Date.now() - started);
  });

  app.addHook("onSend", async (_request, reply, payload) => {
    reply.header("x-content-type-options", "nosniff");
    reply.header("referrer-policy", "no-referrer");
    reply.header("x-request-id", reply.request.id);
    reply.header("x-powerchain-version", VERSION);
    reply.header("x-powerchain-contract-version", "2026-08-29");
    if (reply.request.url.startsWith("/api/")) reply.header("cache-control", "no-store");
    return payload;
  });

  app.get("/api/v1/health", { schema: { tags: ["System"], summary: "Liveness check" } }, async () => ({
    status: "ok" as const,
    version: VERSION,
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  }));

  app.get("/api/v1/config/public", { schema: { tags: ["System"], summary: "Public, non-secret runtime configuration" } }, async () => ({
    version: VERSION,
    network: publicNetwork(),
    pwrcMint: process.env.PWRC_MINT?.trim() || null,
    providers: providerFlags(),
    features: { solana: true, compatibilityAliases: true, websiteOriginProxy: true, realtime: true },
  }));

  app.get("/api/v1/providers/status", { schema: { tags: ["System"], summary: "Redacted provider configuration and runtime telemetry" } }, async () => getProviderStatus());

  app.get("/api/v1/observability/slo", { schema: { tags: ["System"], summary: "Rolling API SLO and error-budget status" } }, async () => getSloSnapshot());

  app.get("/api/v1/ready", { schema: { tags: ["System"], summary: "Dependency/readiness check" } }, async (_request, reply) => {
    const strict = process.env.READINESS_STRICT === "true" || process.env.POWERCHAIN_ENV === "production";
    const requiredProviders = (process.env.REQUIRED_HEALTHY_PROVIDERS || "SOLANA_RPC").split(",").map(value => value.trim()).filter(Boolean);
    const warmMarketMint = process.env.READINESS_MARKET_MINT?.trim() || process.env.PWRC_MINT?.trim() || null;
    try {
      const overview = await getSolanaOverview();
      const programs = await getSolanaPrograms();
      let market = { required: strict && process.env.READINESS_REQUIRE_MARKET !== "false", ok: true, detail: "Market warm-up not required" };
      if (market.required) {
        if (!warmMarketMint) market = { ...market, ok: false, detail: "READINESS_MARKET_MINT or PWRC_MINT is required for strict market readiness" };
        else {
          try {
            const quote = await getSolanaMarket(warmMarketMint);
            market = { ...market, ok: quote.status === "LIVE", detail: `${quote.primaryProvider} ${quote.status}` };
          } catch (error) {
            market = { ...market, ok: false, detail: error instanceof SolanaDataError ? `${error.code}: ${error.message}` : error instanceof Error ? error.message : "Market readiness failed" };
          }
        }
      }
      const providerSnapshot = getProviderStatus();
      const sloSnapshot = getSloSnapshot();
      const sloRequired = strict && process.env.READINESS_REQUIRE_SLO === "true";
      const sloOk = !sloRequired || (sloSnapshot.evaluable && sloSnapshot.ok === true);
      const clusterMismatch = overview.clusterVerification.matchesExpected === false;
      const networkMismatch = overview.network !== publicNetwork();
      const chainOk = overview.chain.health === "ok" && overview.chain.slot != null && overview.chain.blockHeight != null && Boolean(overview.chain.blockhash);
      const expectedFingerprints = expectedProgramFingerprints();
      const requiredProgramRows = programs.programs.filter(program => program.required);
      const fingerprintFailures = requiredProgramRows.filter(program => {
        const expected = expectedFingerprints[program.slug];
        return strict && (!expected || expected.toLowerCase() !== program.deploymentFingerprintSha256?.toLowerCase());
      });
      const programsOk = programs.verification.requiredMissing === 0 && requiredProgramRows.every(program => program.deploymentVerified && program.state === "DEPLOYED") && fingerprintFailures.length === 0;
      const providerFailures = requiredProviders.map(name => providerSnapshot.providers.find(provider => provider.provider === name)).filter(provider => !provider || !provider.configured || provider.state !== "LIVE" || !provider.fresh || !provider.lastCheckedAt);
      const providersOk = providerFailures.length === 0;
      const providerQuorumOk = strict ? providerSnapshot.summary.rawQuorumMet : providerSnapshot.summary.quorumMet;
      const ready = chainOk && !clusterMismatch && !networkMismatch && (!strict || (programsOk && providersOk && providerQuorumOk && market.ok && sloOk));
      const degraded = ready && (overview.status !== "LIVE" || programs.status !== "LIVE" || providerSnapshot.status !== "LIVE");
      const status = ready ? (degraded ? "DEGRADED" : "READY") : "NOT_READY";
      const body = {
        ready,
        status,
        strict,
        network: overview.network,
        intendedNetwork: publicNetwork(),
        cluster: {
          genesisHash: overview.clusterVerification.genesisHash,
          expectedGenesisHash: overview.clusterVerification.expectedGenesisHash,
          matchesExpected: overview.clusterVerification.matchesExpected,
        },
        checks: {
          rpc: { ok: chainOk, detail: chainOk ? `slot ${overview.chain.slot}; block ${overview.chain.blockHeight}` : "RPC chain state unavailable" },
          cluster: { ok: !clusterMismatch && !networkMismatch, detail: clusterMismatch ? "Genesis hash does not match configured cluster" : networkMismatch ? `Observed ${overview.network}; intended ${publicNetwork()}` : "Cluster identity verified" },
          programs: { ok: programsOk, detail: programsOk ? `${programs.verification.verified} program deployments verified with pinned fingerprints` : fingerprintFailures.length ? `Program fingerprint mismatch/unpinned: ${fingerprintFailures.map(program => program.slug).join(", ")}` : `${programs.verification.requiredMissing} required program(s) missing or invalid` },
          providers: { ok: providersOk, detail: providersOk ? `Required providers healthy and fresh: ${requiredProviders.join(", ")}` : `Required providers not fresh/LIVE: ${providerFailures.map(provider => provider?.provider || "missing").join(", ")}` },
          providerQuorum: { ok: providerQuorumOk, detail: `${providerSnapshot.summary.liveMarketProviders}/${providerSnapshot.summary.requiredQuorum} live market providers · raw=${providerSnapshot.summary.rawQuorumMet} · effective=${providerSnapshot.summary.quorumMet}` },
          market,
          slo: { required: sloRequired, ok: sloOk, detail: !sloRequired ? "SLO readiness not required" : !sloSnapshot.evaluable ? `SLO warm-up ${sloSnapshot.sampleCount}/${sloSnapshot.minimumSamples} samples` : `availability ${sloSnapshot.availabilityPct}% / p95 ${sloSnapshot.p95LatencyMs} ms` },
        },
      };
      return reply.code(ready ? 200 : 503).send(body);
    } catch (error) {
      const detail = error instanceof SolanaDataError ? `${error.code}: ${error.message}` : error instanceof Error ? error.message : "Readiness check failed";
      return reply.code(503).send({ ready: false, status: "NOT_READY", strict, network: publicNetwork(), intendedNetwork: publicNetwork(), checks: { rpc: { ok: false, detail } } });
    }
  });

  await registerPowerChainSolanaApi(app);

  app.get("/api/v1/openapi.json", { schema: { hide: true } }, async (_request, reply) => reply.send(app.swagger()));
  app.get("/api/openapi.json", { schema: { hide: true } }, async (_request, reply) => reply.send(app.swagger()));
  app.get("/api/docs", { schema: { hide: true } }, async (_request, reply) => reply.redirect("/api/swagger"));

  app.get("/api/v1/ws/solana", { websocket: true }, (socket) => {
    let topics = new Set<string>(["overview"]);
    let closed = false;
    let messageCount = 0;
    const send = (value: unknown) => { if (!closed && socket.readyState === 1) socket.send(JSON.stringify(value)); };
    const publish = async () => {
      try {
        const payload: Record<string, unknown> = { type: "snapshot", timestamp: new Date().toISOString() };
        if (topics.has("overview")) payload.overview = await getSolanaOverview();
        if (topics.has("programs")) payload.programs = await getSolanaPrograms();
        send(payload);
      } catch (error) {
        send({ type: "error", code: error instanceof SolanaDataError ? error.code : "SNAPSHOT_FAILED", message: error instanceof Error ? error.message : "Snapshot failed" });
      }
    };
    send({ type: "hello", version: VERSION, topics: ["overview", "programs"], intervalSeconds: 30 });
    void publish();
    const timer = setInterval(() => void publish(), 30_000);
    socket.on("message", raw => {
      messageCount += 1;
      if (messageCount > 30) { send({ type: "error", code: "MESSAGE_LIMIT_EXCEEDED" }); return socket.close(1008, "policy limit"); }
      if (raw.byteLength > 4096) return send({ type: "error", code: "MESSAGE_TOO_LARGE" });
      try {
        const message = JSON.parse(raw.toString()) as { type?: string; topics?: string[] };
        if (message.type !== "subscribe" || !Array.isArray(message.topics)) return send({ type: "error", code: "INVALID_MESSAGE" });
        topics = new Set(message.topics.filter(topic => topic === "overview" || topic === "programs"));
        if (!topics.size) topics.add("overview");
        send({ type: "subscribed", topics: [...topics] });
        void publish();
      } catch { send({ type: "error", code: "INVALID_JSON" }); }
    });
    socket.on("close", () => { closed = true; clearInterval(timer); });
    socket.on("error", () => { closed = true; clearInterval(timer); });
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, "request failed");
    if (error instanceof SolanaDataError) return reply.code(error.statusCode).send({ code: error.code, message: error.message, details: error.details });
    const status = typeof error.statusCode === "number" && error.statusCode >= 400 ? error.statusCode : 500;
    return reply.code(status).send({ code: status >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR", message: status >= 500 ? "The request could not be completed." : error.message, requestId: request.id });
  });

  return app;
}
