"use client";
import { useCallback } from "react";
import type { SolanaProgramInfo } from "@powerchain/crisis-api-client";
import { fetchSolanaPrograms } from "../data/fetch-providers";
import { usePollingResource } from "../hooks/use-polling-resource";

const compact=(v:string|null)=>v?`${v.slice(0,5)}…${v.slice(-5)}`:"—";

export function ProgramsOverview() {
  const loader=useCallback(()=>fetchSolanaPrograms(),[]);
  const state=usePollingResource(loader,60_000,180_000);
  return <div className="programs-live">
    <div className="programs-live-head"><span>{state.data?.verification.verified ?? 0} verified</span><span>{state.data?.verification.requiredMissing ?? 0} required missing</span><button className="button secondary compact" onClick={()=>void state.refresh()} disabled={state.refreshing}>{state.refreshing?"Refreshing…":"Refresh"}</button></div>
    {state.error?<p className="validate-error">{state.error}</p>:null}
    <div className="programs-cards">{(state.data?.programs ?? []).map((program:SolanaProgramInfo)=><article key={program.slug}><div><span className="eyebrow">{program.family}</span><h3>{program.label}</h3></div><dl><div><dt>Status</dt><dd>{program.state}</dd></div><div><dt>Program ID</dt><dd className="mono">{compact(program.programId)}</dd></div><div><dt>Loader</dt><dd>{program.loader ?? "—"}</dd></div><div><dt>Fingerprint</dt><dd className="mono">{compact(program.deploymentFingerprintSha256)}</dd></div></dl>{program.required?<span className="program-required">Required</span>:null}</article>)}</div>
  </div>;
}
