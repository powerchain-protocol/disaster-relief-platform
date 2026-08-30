import { validateRuntimeConfig } from "./config/validate-runtime-config.js";
import { buildApp } from "./app.js";

const DEFAULT_PORT = 4000;
validateRuntimeConfig();
const MAX_DEV_PORT_ATTEMPTS = 10;
const app = await buildApp();

function parsePort(value: string | undefined, fallback = DEFAULT_PORT) {
  if (!value?.trim()) return fallback;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT "${value}". Expected an integer between 1 and 65535.`);
  }
  return port;
}

const requestedPort = parsePort(process.env.PORT);
const host = process.env.HOST?.trim() || "0.0.0.0";
const isProduction = process.env.NODE_ENV === "production" || process.env.POWERCHAIN_ENV === "production";
const allowPortFallback = !isProduction && process.env.DEV_PORT_FALLBACK !== "false";

async function shutdown(signal: string) {
  app.log.info({ signal }, "shutting down");
  try { await app.close(); process.exit(0); }
  catch (error) { app.log.error({ err: error }, "shutdown failed"); process.exit(1); }
}
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

async function listen() {
  let port = requestedPort;
  for (let attempt = 0; attempt < (allowPortFallback ? MAX_DEV_PORT_ATTEMPTS : 1); attempt += 1) {
    try {
      const address = await app.listen({ port, host });
      app.log.info({ address, host, port, requestedPort, fallbackUsed: port !== requestedPort }, "PowerChain Relief API listening");
      return;
    } catch (error) {
      const code = error instanceof Error && "code" in error ? String((error as NodeJS.ErrnoException).code) : null;
      if (code !== "EADDRINUSE" || !allowPortFallback || attempt === MAX_DEV_PORT_ATTEMPTS - 1) {
        app.log.error({ err: error, host, port }, code === "EADDRINUSE"
          ? `Port ${port} is already in use. Stop the existing process or set PORT to a free port.`
          : "API failed to start");
        throw error;
      }
      const nextPort = port + 1;
      app.log.warn({ requestedPort, occupiedPort: port, nextPort }, `Port ${port} is busy; retrying on ${nextPort} for local development.`);
      port = nextPort;
    }
  }
}
await listen();
