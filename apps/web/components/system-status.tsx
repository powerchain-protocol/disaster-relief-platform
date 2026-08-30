"use client";

import { useCallback } from "react";
import { powerChainApi } from "../lib/api";
import { usePollingResource } from "../hooks/use-polling-resource";

function health(ok: boolean | null | undefined, fallback = "Unknown") {
  if (ok === true) return "Healthy";
  if (ok === false) return "Degraded";
  return fallback;
}

export function SystemStatus() {
  const ready=usePollingResource(useCallback(()=>powerChainApi.ready(),[]),30_000,90_000);
  const providers=usePollingResource(useCallback(()=>powerChainApi.providerStatus(),[]),30_000,90_000);
  const slo=usePollingResource(useCallback(()=>powerChainApi.sloStatus(),[]),30_000,90_000);

  const refreshing=ready.refreshing||providers.refreshing||slo.refreshing;
  const refresh=()=>{void ready.refresh();void providers.refresh();void slo.refresh();};

  return <div className="system-status">
    <div className="status-summary">
      <div><small>READINESS</small><b>{ready.data?.status ?? (ready.loading?"Loading":"Unavailable")}</b></div>
      <div><small>PROVIDERS</small><b>{providers.data?.status ?? (providers.loading?"Loading":"Unavailable")}</b></div>
      <div><small>MARKET QUORUM</small><b>{providers.data ? health(providers.data.summary.rawQuorumMet) : "—"}</b></div>
      <div><small>SLO</small><b>{slo.data ? health(slo.data.ok, slo.data.evaluable ? "Unknown" : "Warming") : "—"}</b></div>
      <button className="button secondary compact" onClick={refresh} disabled={refreshing}>{refreshing?"Refreshing…":"Refresh all"}</button>
    </div>

    <div className="status-panels">
      <article>
        <span className="eyebrow">RPC POOL</span>
        <h3>{providers.data?.rpc.endpointCount ?? "—"} configured endpoints</h3>
        <p>Active endpoint IDs are redacted. Circuit state and failover remain bounded to configured RPC endpoints.</p>
        <dl>
          <div><dt>Active endpoint</dt><dd className="mono">{providers.data?.rpc.activeEndpointId ?? "—"}</dd></div>
          <div><dt>Max failover attempts</dt><dd>{providers.data?.rpc.maxFailoverAttempts ?? "—"}</dd></div>
        </dl>
      </article>

      <article>
        <span className="eyebrow">PROVIDER QUORUM</span>
        <h3>{providers.data ? `${providers.data.summary.liveMarketProviders}/${providers.data.summary.requiredQuorum}` : "—"} live / required</h3>
        <p>Raw quorum is used by strict readiness and release checks; hysteresis only stabilizes operator presentation.</p>
        <dl>
          <div><dt>Raw quorum</dt><dd>{providers.data ? (providers.data.summary.rawQuorumMet?"Met":"Not met") : "—"}</dd></div>
          <div><dt>Effective quorum</dt><dd>{providers.data ? (providers.data.summary.quorumMet?"Met":"Not met") : "—"}</dd></div>
        </dl>
      </article>

      <article>
        <span className="eyebrow">SLO WINDOW</span>
        <h3>{slo.data?.evaluable ? `${slo.data.availabilityPct ?? "—"}% availability` : "Warming"}</h3>
        <p>Rolling availability and p95 latency are evaluated independently before the combined status becomes healthy.</p>
        <dl>
          <div><dt>p95 latency</dt><dd>{slo.data?.p95LatencyMs == null ? "—" : `${slo.data.p95LatencyMs} ms`}</dd></div>
          <div><dt>Samples</dt><dd>{slo.data ? `${slo.data.sampleCount}/${slo.data.minimumSamples}` : "—"}</dd></div>
        </dl>
      </article>
    </div>

    {(ready.error||providers.error||slo.error)
      ? <p className="status-error">One or more status resources are unavailable. The last verified state is preserved where possible.</p>
      : null}
  </div>;
}
