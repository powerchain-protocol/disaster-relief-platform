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
  <div className="architecture-intro"><span className="eyebrow">OPERATING MODEL</span><h2 className="section-title">A controlled path from crisis signal to verified impact.</h2><p className="section-copy">Every stage has a distinct responsibility, evidence boundary and authority gate. Connectors represent progression—not equivalence between states.</p></div>
  <div className="operation-flow" role="list">{stages.map(([number,title,body],index)=><div className="operation-step-wrap" key={title} role="listitem"><article className="operation-step"><span className="operation-step-index">{number}</span><div><strong>{title}</strong><small>{body}</small></div></article>{index<stages.length-1?<div className="operation-connector" aria-hidden="true"><span/></div>:null}</div>)}</div>
  <div className="accounting-invariant"><b>RAISED</b><span>≠</span><b>AVAILABLE</b><span>≠</span><b>ALLOCATED</b><span>≠</span><b>ESCROWED</b><span>≠</span><b>RELEASED</b><span>≠</span><b>VERIFIED IMPACT</b></div>
 </div></section>
}
