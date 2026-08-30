"use client";
import { useState } from "react";

const capabilities = [
  ["Capital controls","Raised, available, allocated, escrowed, released, spent, delivered and verified-impact states remain distinct.","CAPITAL"],
  ["Solana verification","Cluster identity, required programs, executable loaders, ProgramData and pinned deployment fingerprints.","NETWORK"],
  ["Evidence registry","Evidence lineage, release receipts, reconciliation records and verification state stay independently inspectable.","TRUST"],
  ["Provider resilience","Bounded RPC failover, provider freshness, quorum and explicit degraded states without synthetic fallback.","DATA"],
  ["Wallet intelligence","Connect a Solana wallet independently from operator identity and inspect authoritative SOL plus indexed assets.","WALLET"],
  ["Program assurance","Required program configuration, deployment status, loader identity and change-control fingerprints.","PROGRAMS"],
  ["Milestone releases","Policy-bound capital routing can require approvals, escrow conditions and evidence before release.","RESPONSE"],
  ["Token-2022 assets","Inspect token program, decimals, supply, authorities and supported Token-2022 extension metadata.","ASSETS"],
  ["Market intelligence","Pyth, Jupiter, CoinGecko, Birdeye and Helius observations remain source-labelled and analytics-only.","MARKETS"],
  ["Operational status","Readiness, provider quorum, RPC circuit state and rolling SLOs are visible from one status surface.","OPS"],
  ["API infrastructure","Versioned REST contracts, OpenAPI, Swagger, Postman and same-origin website proxies.","API"],
  ["Audit boundary","Execution, settlement, evidence and impact claims remain separate and independently reconcilable.","AUDIT"],
];

export function Features() {
  const [all,setAll]=useState(false);
  const shown=all?capabilities:capabilities.slice(0,6);
  return <section id="features" className="section">
    <div className="shell">
      <div className="section-head-row">
        <div><span className="eyebrow">CORE CAPABILITIES</span><h2 className="section-title">Built for operational trust.</h2><p className="section-copy">Six primary capabilities define the operating surface. Expand the complete system map when deeper technical context is needed.</p></div>
        <button className="button secondary" type="button" onClick={()=>setAll(v=>!v)}>{all?"Show core features":"See all features"}</button>
      </div>
      <div className="feature-grid feature-grid-six">{shown.map(([title,body,tag],index)=><article key={title}>
        <div className="feature-card-head"><span className="feature-number">{String(index+1).padStart(2,"0")}</span><span className="feature-tag">{tag}</span></div>
        <h3>{title}</h3><p>{body}</p>
      </article>)}</div>
    </div>
  </section>;
}
