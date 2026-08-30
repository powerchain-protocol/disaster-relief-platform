"use client";
import { useCallback,useMemo,useState } from "react";
import type { SolanaProgramInfo } from "@powerchain/crisis-api-client";
import { fetchSolanaPrograms } from "../data/fetch-providers";
import { usePollingResource } from "../hooks/use-polling-resource";
import { ChainIcon } from "./web3-icon";

const compact=(v:string|null)=>v?`${v.slice(0,7)}…${v.slice(-7)}`:"—";
const tone=(state:string)=>state==="DEPLOYED"?"verified":state==="UNCONFIGURED"?"neutral":"attention";

export function ProgramsOverview(){
 const loader=useCallback(()=>fetchSolanaPrograms(),[]);
 const state=usePollingResource(loader,60_000,180_000);
 const[filter,setFilter]=useState<"ALL"|"REQUIRED"|"DEPLOYED"|"ISSUES">("ALL");
 const rows=useMemo(()=>{const items=state.data?.programs??[];if(filter==="REQUIRED")return items.filter(p=>p.required);if(filter==="DEPLOYED")return items.filter(p=>p.state==="DEPLOYED");if(filter==="ISSUES")return items.filter(p=>p.state!=="DEPLOYED");return items},[state.data,filter]);

 return <div className="programs-workspace">
  <div className="programs-summary">
   <div className="programs-network"><ChainIcon network="solana" size={30}/><span><small>NETWORK</small><b>{state.data?.network??"Solana"}</b></span></div>
   <div><small>CONFIGURED</small><b>{state.data?.verification.configured??0}</b></div>
   <div><small>VERIFIED</small><b>{state.data?.verification.verified??0}</b></div>
   <div><small>REQUIRED MISSING</small><b>{state.data?.verification.requiredMissing??0}</b></div>
   <button className="button secondary compact" onClick={()=>void state.refresh()} disabled={state.refreshing}>{state.refreshing?"Refreshing…":"Refresh registry"}</button>
  </div>
  <div className="programs-toolbar"><div className="program-filter-tabs">{(["ALL","REQUIRED","DEPLOYED","ISSUES"] as const).map(item=><button key={item} className={filter===item?"active":""} onClick={()=>setFilter(item)}>{item==="ALL"?"All programs":item==="ISSUES"?"Needs attention":item[0]+item.slice(1).toLowerCase()}</button>)}</div><span>{rows.length} records</span></div>
  {state.error?<div className="program-resource-error"><strong>Program registry unavailable</strong><p>{state.error}</p></div>:null}
  {state.loading&&!state.data?<div className="program-loading">Loading deployment registry…</div>:null}
  <div className="program-registry">{rows.map((program:SolanaProgramInfo)=><article className="program-row" key={program.slug}>
   <div className="program-row-main"><div className="program-icon"><ChainIcon network="solana" size={24}/></div><div><span className="program-family">{program.family}</span><h3>{program.label}</h3><small>{program.slug}</small></div></div>
   <div className="program-row-state"><span className={`program-state ${tone(program.state)}`}><i/>{program.state.replaceAll("_"," ")}</span>{program.required?<small>Required for readiness</small>:<small>Optional program</small>}</div>
   <dl className="program-row-details">
    <div><dt>Program ID</dt><dd className="mono" title={program.programId??undefined}>{compact(program.programId)}</dd></div>
    <div><dt>Loader</dt><dd>{program.loader?.replaceAll("_"," ")??"—"}</dd></div>
    <div><dt>ProgramData</dt><dd className="mono">{compact(program.programDataAddress)}</dd></div>
    <div><dt>Deploy slot</dt><dd>{program.lastDeploySlot?.toLocaleString()??"—"}</dd></div>
    <div><dt>Upgrade authority</dt><dd className="mono">{compact(program.upgradeAuthority)}</dd></div>
    <div><dt>Fingerprint</dt><dd className="mono">{compact(program.deploymentFingerprintSha256)}</dd></div>
   </dl>
   <div className="program-row-foot"><span>{program.deploymentVerified?"Executable deployment verified":"Deployment verification incomplete"}</span>{program.programId?<button type="button" className="program-copy" onClick={()=>void navigator.clipboard?.writeText(program.programId!)}>Copy program ID</button>:null}</div>
  </article>)}{!state.loading&&rows.length===0?<div className="program-empty">No programs match this filter.</div>:null}</div>
 </div>
}
