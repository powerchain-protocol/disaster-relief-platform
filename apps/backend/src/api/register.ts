import type { FastifyInstance } from "fastify";
import { registerLegacySolanaRoutes } from "./legacy-solana.js";
import { registerSolanaV1Routes } from "./v1/solana.js";
import { registerWalletV1Routes } from "./v1/wallet.js";
import { registerCapitalV1Routes } from "./v1/capital.js";

export async function registerPowerChainSolanaApi(app: FastifyInstance) {
  await registerSolanaV1Routes(app);
  await registerWalletV1Routes(app);
  await registerCapitalV1Routes(app);
  await registerLegacySolanaRoutes(app);
}
