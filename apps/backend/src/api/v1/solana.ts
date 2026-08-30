import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getSolanaAsset, getSolanaMarket, getSolanaOverview, getSolanaPrograms, SolanaDataError } from "../../services/solana-data.js";

const noStore = { "cache-control": "no-store" };

function sendError(reply: FastifyReply, error: unknown) {
  if (error instanceof SolanaDataError) return reply.code(error.statusCode).send({ code: error.code, message: error.message, details: error.details });
  throw error;
}

export async function registerSolanaV1Routes(app: FastifyInstance) {
  app.get("/api/v1/solana/overview", {
    schema: { tags: ["Solana"], summary: "Get Solana RPC/cluster health, slot, block height, version and latest blockhash", response: { 200: { type: "object", additionalProperties: true } } },
  }, async (_request, reply) => {
    try { return reply.headers(noStore).send(await getSolanaOverview()); } catch (error) { return sendError(reply, error); }
  });

  app.get("/api/v1/solana/programs", {
    schema: { tags: ["Solana"], summary: "Verify configured PowerChain Launchpad and Crisis program deployments", response: { 200: { type: "object", additionalProperties: true } } },
  }, async (_request, reply) => {
    try { return reply.headers(noStore).send(await getSolanaPrograms()); } catch (error) { return sendError(reply, error); }
  });

  app.get<{ Querystring: { mint?: string } }>("/api/v1/solana/market", {
    schema: {
      tags: ["Solana"], summary: "Resolve source-aware market data for an explicit Solana mint",
      querystring: { type: "object", required: ["mint"], properties: { mint: { type: "string", minLength: 32, maxLength: 44 } } },
      response: { 200: { type: "object", additionalProperties: true } },
    },
  }, async (request, reply) => {
    try { return reply.headers(noStore).send(await getSolanaMarket(request.query.mint ?? "")); } catch (error) { return sendError(reply, error); }
  });

  app.get<{ Params: { mint: string } }>("/api/v1/solana/assets/:mint", {
    schema: {
      tags: ["Solana"], summary: "Inspect SPL / Token-2022 mint supply, authorities, extensions and metadata",
      params: { type: "object", required: ["mint"], properties: { mint: { type: "string", minLength: 32, maxLength: 44 } } },
      response: { 200: { type: "object", additionalProperties: true } },
    },
  }, async (request, reply) => {
    try { return reply.headers(noStore).send(await getSolanaAsset(request.params.mint)); } catch (error) { return sendError(reply, error); }
  });
}
