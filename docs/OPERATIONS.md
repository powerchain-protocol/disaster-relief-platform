# Operations and Production Readiness

## Production gate

A production deployment should fail closed unless all required controls pass:

- intended network is `mainnet-beta`;
- expected Solana genesis is configured and observed;
- required program IDs are configured;
- required program fingerprints match;
- RPC failover has distinct configured endpoints;
- required market providers are configured;
- raw provider quorum is met;
- readiness SLO is evaluable and healthy when required;
- explicit CORS origins are configured;
- internal tokens are strong;
- mutation persistence is durable;
- signer boundary is production-ready.

## Unknown execution

A submitted transaction whose outcome cannot be established is `EXECUTION_UNKNOWN`. Operators must reconcile that signature before initiating another payment.

## Observability

Track at minimum:
- request count and failure rate;
- p95 latency;
- provider freshness;
- raw and effective quorum;
- RPC failover/circuit state;
- program verification;
- WebSocket reconnect/error rate;
- reconciliation exceptions.


## Program release gate

Production requires all registry entries marked `REQUIRED` to be configured, executable, loader-valid and fingerprint-pinned. Optional programs may gate individual capabilities but do not globally block readiness unless policy elevates them.
