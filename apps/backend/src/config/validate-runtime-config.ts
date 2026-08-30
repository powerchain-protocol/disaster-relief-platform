type Problem = { field: string; message: string };

function int(value: string | undefined, fallback: number) {
  const parsed = value == null || value.trim() === "" ? fallback : Number(value);
  return Number.isInteger(parsed) ? parsed : NaN;
}

function url(value: string | undefined) {
  if (!value?.trim()) return null;
  try { return new URL(value); } catch { return null; }
}

export function validateRuntimeConfig() {
  const problems: Problem[] = [];
  const production = process.env.NODE_ENV === "production" || process.env.POWERCHAIN_ENV === "production";

  const port = int(process.env.PORT, 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) problems.push({ field: "PORT", message: "must be an integer from 1 to 65535" });

  for (const [field, fallback] of [
    ["SOLANA_RPC_TIMEOUT_MS", 8_000],
    ["HELIUS_TIMEOUT_MS", 7_500],
    ["PYTH_TIMEOUT_MS", 7_500],
    ["BIRDEYE_TIMEOUT_MS", 7_500],
    ["COINGECKO_TIMEOUT_MS", 7_500],
  ] as const) {
    const value = int(process.env[field], fallback);
    if (!Number.isInteger(value) || value < 250 || value > 60_000) {
      problems.push({ field, message: "must be an integer between 250 and 60000 milliseconds" });
    }
  }

  for (const field of ["SOLANA_RPC_URL","HELIUS_RPC_URL","PYTH_HERMES_URL","BIRDEYE_API_BASE_URL","COINGECKO_API_BASE_URL"] as const) {
    const value = process.env[field];
    if (value?.trim() && !url(value)) problems.push({ field, message: "must be a valid absolute URL" });
  }

  if (production) {
    if ((process.env.SOLANA_NETWORK || "").trim() !== "mainnet-beta") {
      problems.push({ field: "SOLANA_NETWORK", message: "must be mainnet-beta in production" });
    }
    if (process.env.DEV_PORT_FALLBACK === "true") {
      problems.push({ field: "DEV_PORT_FALLBACK", message: "must not be true in production" });
    }
    const origins=(process.env.CORS_ORIGINS || "").split(",").map(value=>value.trim()).filter(Boolean);
    if (!origins.length) problems.push({ field: "CORS_ORIGINS", message: "must define at least one explicit production origin" });
    if (origins.includes("*")) problems.push({ field: "CORS_ORIGINS", message: "must not contain wildcard origin in production" });

    const internalToken=process.env.POWERCHAIN_INTERNAL_API_TOKEN?.trim();
    if (internalToken && internalToken.length < 32) {
      problems.push({ field: "POWERCHAIN_INTERNAL_API_TOKEN", message: "must be at least 32 characters when configured" });
    }

    if (process.env.READINESS_STRICT === "true" && !process.env.SOLANA_EXPECTED_GENESIS_HASH?.trim()) {
      problems.push({ field: "SOLANA_EXPECTED_GENESIS_HASH", message: "is required when strict readiness is enabled in production" });
    }
  }

  if (problems.length) {
    const error = new Error(`Runtime configuration invalid: ${problems.map(p => `${p.field} ${p.message}`).join("; ")}`) as Error & { code?: string; problems?: Problem[] };
    error.code = "INVALID_RUNTIME_CONFIG";
    error.problems = problems;
    throw error;
  }

  return { production, port };
}
