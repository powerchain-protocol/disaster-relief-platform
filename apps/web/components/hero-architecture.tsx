const lanes=[
 ["CRISIS SIGNALS","Evidence · operators · conditions"],
 ["POLICY + TRUST","Identity · roles · approvals"],
 ["CAPITAL CONTROL","Available · allocated · escrowed"],
 ["SETTLEMENT","Solana · reconciliation · receipts"],
];
export function HeroArchitecture(){
 return <div className="hero-architecture" aria-label="PowerChain Relief operating architecture illustration">
  <div className="hero-architecture-head"><span><i/>Operational architecture</span><b>Source-aware</b></div>
  <div className="hero-architecture-body">
   <div className="hero-architecture-source"><span>REAL-WORLD RESPONSE</span><strong>Verified operational inputs</strong></div>
   <div className="hero-architecture-rail"/>
   <div className="hero-architecture-lanes">{lanes.map(([title,body],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><div><strong>{title}</strong><small>{body}</small></div></article>)}</div>
   <div className="hero-architecture-result"><span>OUTCOME</span><strong>Auditable release → verified impact</strong></div>
  </div>
  <div className="hero-architecture-foot"><span>Postgres · operational truth</span><span>Solana · settlement truth</span></div>
 </div>
}
