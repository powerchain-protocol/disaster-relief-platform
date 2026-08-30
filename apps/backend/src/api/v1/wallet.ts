import type { FastifyInstance } from "fastify";
import { getWalletPortfolio } from "../../services/wallet-data.js";

const noStore = { "cache-control": "no-store" };

export async function registerWalletV1Routes(app: FastifyInstance) {
  app.get<{ Params: { address: string } }>("/api/v1/wallet/:address/portfolio", {
    config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    schema: {
      tags: ["Wallet"],
      summary: "Fetch a Solana wallet portfolio using RPC-native balance plus optional Helius DAS assets",
      params: {
        type: "object",
        required: ["address"],
        properties: { address: { type: "string", minLength: 32, maxLength: 44 } },
      },
      response: { 200: { type: "object", additionalProperties: true } },
    },
  }, async (request, reply) => {
    try {
      return reply.headers(noStore).send(await getWalletPortfolio(request.params.address));
    } catch (error) {
      const e = error as Error & { statusCode?: number; code?: string };
      return reply.code(e.statusCode || 500).send({ code: e.code || "WALLET_PORTFOLIO_ERROR", message: e.message || "Wallet portfolio failed" });
    }
  });
}
