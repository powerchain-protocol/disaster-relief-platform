const stages=[
 ["01","SENSE","Crisis signals, operators and evidence inputs"],
 ["02","VERIFY","Source identity, policy and evidence quality"],
 ["03","FUND","Create controlled capital intent"],
 ["04","ROUTE","Allocate without conflating release"],
 ["05","PROTECT","Escrow, approvals and deterministic controls"],
 ["06","RESPOND","Authorized real-world execution"],
 ["07","PROVE","Delivery and impact evidence"],
 ["08","AUDIT","Reconciliation, receipts and immutable history"],
];
export function TrustArchitecture(){
 return <section className="section architecture-section"><div className="shell">
   <div className="architecture-intro"><span className="eyebrow">OPERATING ARCHITECTURE</span><h2 className="section-title">Capital state and evidence state never collapse into one number.</h2><p className="section-copy">PowerChain keeps operational truth, authorization, settlement and verified impact separate so every transition has a clear source and accountable authority.</p></div>
   <div className="architecture-flow">{stages.map(([n,t,b],i)=><div className="architecture-stage" key={t}><span>{n}</span><strong>{t}</strong><small>{b}</small>{i<stages.length-1?<i aria-hidden="true">→</i>:null}</div>)}</div>
   <div className="accounting-invariant"><b>RAISED</b><span>≠</span><b>AVAILABLE</b><span>≠</span><b>ALLOCATED</b><span>≠</span><b>ESCROWED</b><span>≠</span><b>RELEASED</b><span>≠</span><b>VERIFIED IMPACT</b></div>
 </div></section>
}
