import { SiteHeader, SiteFooter } from "../../components/site-shell";
import { SystemStatus } from "../../components/system-status";

export default function Page(){
  return <main id="main">
    <SiteHeader/>
    <section className="shell page-hero compact-page-hero">
      <span className="eyebrow">SYSTEM STATUS</span>
      <h1>Operational readiness without hidden fallbacks.</h1>
      <p>Inspect strict readiness, RPC failover, provider quorum and rolling SLO state from one source-aware surface.</p>
    </section>
    <section className="section section-muted"><div className="shell"><SystemStatus/></div></section>
    <SiteFooter/>
  </main>
}
