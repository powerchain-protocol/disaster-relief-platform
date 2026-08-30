"use client";
import { useCallback } from "react";
import { fetchProviderHealth } from "../data/fetch-providers";
import { usePollingResource } from "../hooks/use-polling-resource";

export function ProviderStatusStrip() {
  const loader=useCallback(()=>fetchProviderHealth(),[]);
  const state=usePollingResource(loader,30_000,90_000);
  const data=state.data;
  return <section className="provider-strip" aria-label="Provider status">
    <div><small>NETWORK</small><b>{data?.network ?? "—"}</b></div>
    <div><small>RPC</small><b>{data ? `${data.rpc.endpointCount} endpoints` : "—"}</b></div>
    <div><small>PROVIDERS</small><b>{data ? `${data.summary.live}/${data.summary.configured} live` : "—"}</b></div>
    <div><small>MARKET QUORUM</small><b>{data ? (data.summary.rawQuorumMet ? "Met" : "Not met") : "—"}</b></div>
    <div><small>STATUS</small><b>{data?.status ?? (state.loading ? "Loading" : "Unavailable")}</b></div>
    <button className="button secondary compact" onClick={()=>void state.refresh()} disabled={state.refreshing}>{state.refreshing?"Refreshing…":"Refresh"}</button>
  </section>;
}
