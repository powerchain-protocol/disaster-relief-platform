import type { FastifyInstance, FastifyReply } from "fastify";
import { getSolanaAsset, getSolanaMarket, getSolanaOverview, SolanaDataError } from "../services/solana-data.js";

function legacyHeaders(reply: FastifyReply, successor: string) {
  reply.header("cache-control", "no-store");
  reply.header("deprecation", "true");
  reply.header("link", `<${successor}>; rel="successor-version"`);
  return reply;
}
function sendError(reply: FastifyReply, error: unknown) {
  if (error instanceof SolanaDataError) return reply.code(error.statusCode).send({ code: error.code, message: error.message, details: error.details });
  throw error;
}
function legacyMarketMint(queryMint?: string) {
  const mint = queryMint?.trim() || process.env.PWRC_MINT?.trim();
  if (!mint) throw new SolanaDataError(400, "PWRC_MINT_NOT_CONFIGURED", "mint is required unless PWRC_MINT is configured for the compatibility route.");
  return mint;
}

export async function registerLegacySolanaRoutes(app: FastifyInstance) {
  app.get("/api/solana/overview", async (_request, reply) => {
    try { return legacyHeaders(reply, "/api/v1/solana/overview").send(await getSolanaOverview()); } catch (error) { return sendError(reply, error); }
  });
  app.get<{ Querystring: { mint?: string } }>("/api/token/market", async (request, reply) => {
    try {
      const mint = legacyMarketMint(request.query.mint);
      return legacyHeaders(reply, `/api/v1/solana/market?mint=${encodeURIComponent(mint)}`).send(await getSolanaMarket(mint));
    } catch (error) { return sendError(reply, error); }
  });
  app.get<{ Params: { mint: string } }>("/api/assets/:mint", async (request, reply) => {
    try { return legacyHeaders(reply, `/api/v1/solana/assets/${encodeURIComponent(request.params.mint)}`).send(await getSolanaAsset(request.params.mint)); } catch (error) { return sendError(reply, error); }
  });
}
