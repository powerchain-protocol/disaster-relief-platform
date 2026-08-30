# PowerChain Relief API

Fastify 5 API for readiness, Solana verification, wallet data, capital controls, release policy, settlement reconciliation and telemetry.

Solana RPC is authoritative for chain state. Market providers are analytics-only. Capital mutations are idempotent and policy-gated. Submitted-but-uncertain settlement remains `EXECUTION_UNKNOWN`.

Production capital mutations remain fail-closed until durable persistence and a production signer adapter are installed.
