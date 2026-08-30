const partnerTypes = [
  ["Relief organizations", "Coordinate verified funding, evidence and milestone-based disbursement."],
  ["Governments & agencies", "Use policy-bound funding and public transparency without exposing signing authority."],
  ["Infrastructure providers", "Connect RPC, oracle, payments, identity and evidence systems through controlled adapters."],
  ["Capital partners", "Track capital state, reconciliation and verified outcomes across the response lifecycle."],
];

export function Partnership() {
  return (
    <section id="partnerships" className="section partnership-section">
      <div className="shell">
        <div className="section-head-row">
          <div><span className="eyebrow">PARTNERSHIPS</span><h2 className="section-title">Built to integrate with the institutions already doing the work.</h2></div>
          <a className="button secondary" href="/about#contact">Partnership enquiries</a>
        </div>
        <div className="partnership-grid">{partnerTypes.map(([t,b]) => <article key={t}><span className="feature-mark">↗</span><h3>{t}</h3><p>{b}</p></article>)}</div>
      </div>
    </section>
  );
}
