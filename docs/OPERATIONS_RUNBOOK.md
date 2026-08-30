# Operations Runbook

## Daily checks

1. Check `/api/v1/ready`.
2. Check `/api/v1/providers/status` for failure counters/latency.
3. Check `/api/v1/solana/overview` for cluster, slot progression and block height.
4. Check `/api/v1/solana/programs` for required-program deployment status.
5. Review market responses for divergence/block-lag/confidence degradation.
6. Review application and provider error-rate alerts.

## Incident: RPC unavailable

Symptoms:

- readiness 503;
- provider state degraded;
- slot/block height unavailable.

Actions:

1. verify private RPC/Helius status;
2. confirm DNS/TLS/network path;
3. validate credential expiry;
4. verify `SOLANA_NETWORK` and expected genesis;
5. switch to approved alternate private RPC if configured;
6. keep write/financial execution disabled until authoritative chain state returns.

## Incident: cluster mismatch

Actions:

1. stop production transaction execution;
2. compare returned genesis hash with `SOLANA_EXPECTED_GENESIS_HASH`;
3. verify RPC URL/provider configuration;
4. do not “fix” by removing genesis binding unless deployment governance explicitly approves it.

## Incident: market provider divergence

Actions:

1. inspect `observations[]`;
2. compare publication/fetch times;
3. inspect Pyth confidence;
4. inspect Jupiter block lag;
5. verify token decimals against RPC;
6. treat degraded result as display-only until policy allows use.

## Incident: required program missing

Actions:

1. verify active cluster;
2. validate program ID from deployment evidence;
3. inspect account/executable/loader status;
4. do not replace with a guessed ID;
5. mark affected Launchpad capability unavailable.

## Incident: provider key exposed

1. revoke/rotate the key immediately;
2. invalidate affected deployment secrets;
3. search build artifacts for `NEXT_PUBLIC_*` leakage;
4. rebuild and redeploy;
5. review provider usage logs;
6. document incident and corrective action.

## Incident: unknown transaction outcome

Use `EXECUTION_UNKNOWN`. Do not retry until chain reconciliation determines whether the original transaction executed.

## Capacity

Watch:

- Fastify request rate
- rate-limit rejections
- provider latency
- cache entries/in-flight count
- WebSocket connection count
- RPC error rate
- Next.js proxy timeout rate

## RPC degradation response

When `/api/v1/providers/status` reports an RPC endpoint circuit as `OPEN`, operators should confirm whether the active fallback is healthy before changing endpoint configuration. Do not clear the circuit by repeatedly restarting the API. Investigate the failed endpoint, restore it, and allow the cooldown/recovery path to re-admit it.

Strict release verification requires at least two configured RPC endpoints and an active endpoint. RPC endpoint IDs in telemetry are redacted hashes, so correlate them to deployment configuration through the private configuration inventory rather than exposing URLs in incident channels.

## SLO breach response

`/api/v1/observability/slo` distinguishes warm-up from a real error-budget breach. `evaluable=false` means insufficient samples; `evaluable=true` with `ok=false` means the availability or p95 target was breached. Production canary and final readiness must not be overridden to bypass an SLO breach.
