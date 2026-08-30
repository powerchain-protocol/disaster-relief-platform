export function DashboardPreview() {
  return (
    <section className="section dashboard-preview-section">
      <div className="shell">
        <div className="section-head-row">
          <div><span className="eyebrow">DASHBOARD PREVIEW</span><h2 className="section-title">Operational truth, not vanity metrics.</h2></div>
          <a className="button" href="/solana">View dashboard</a>
        </div>
        <div className="dashboard-frame">
          <div className="dashboard-toolbar"><span><i className="status-dot"/>PowerChain Relief Console</span><span>Source-aware · Live when verified</span></div>
          <div className="dashboard-grid">
            <article><small>CAPITAL STATE</small><strong>Separated</strong><p>Raised, available, allocated, escrowed, released and verified impact.</p></article>
            <article><small>SOLANA</small><strong>Verified</strong><p>Cluster, genesis, slot, programs and Token-2022 inspection.</p></article>
            <article><small>PROVIDERS</small><strong>Bounded</strong><p>Freshness, quorum, failover and source identity remain visible.</p></article>
            <article><small>EVIDENCE</small><strong>Auditable</strong><p>Reconciliation and release evidence stay attached to decisions.</p></article>
          </div>
          <div className="dashboard-canvas">
            <div className="dashboard-sidebar">
              <b>Command</b><span>Overview</span><span>Capital</span><span>Programs</span><span>Providers</span><span>Evidence</span>
            </div>
            <div className="dashboard-main">
              <div className="dashboard-card dashboard-wide"><small>RESPONSE LIFECYCLE</small><div className="lifecycle">Sense <i/> Verify <i/> Fund <i/> Route <i/> Protect <i/> Prove</div></div>
              <div className="dashboard-card"><small>PROGRAM VERIFICATION</small><strong>Fingerprint-bound</strong><p>Executable loader and expected SHA-256 checks.</p></div>
              <div className="dashboard-card"><small>MARKET DATA</small><strong>Source-aware</strong><p>Provider priority with RPC authority preserved.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
