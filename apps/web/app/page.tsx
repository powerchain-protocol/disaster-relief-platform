import { SiteHeader, SiteFooter } from "../components/site-shell";
import { DashboardPreview } from "../components/dashboard-preview";
import { Partnership } from "../components/partnership";
import { FAQ } from "../components/faq";
import { PartnerStrip } from "../components/partner-strip";
import { CTA } from "../components/cta";
import { Features } from "../components/features";
import { TrustArchitecture } from "../components/trust-architecture";
import { ProviderArchitecture } from "../components/provider-architecture";

export default function Home(){return <main id="main" className="landing">
  <SiteHeader />
  <section className="shell hero-grid">
    <div className="hero-copy"><span className="eyebrow">POWERCHAIN DISASTER RELIEF · v1.0.0</span><h1>Verified capital infrastructure for emergency response.</h1><p>PowerChain Relief connects crisis capital, deterministic policy, evidence and Solana settlement while keeping authority, execution and impact independently verifiable.</p><div className="actions"><a className="button" href="/solana">View dashboard</a><a className="button secondary" href="#product">Explore product</a></div><div className="trust-row"><span>Source-aware</span><span>Fail-closed</span><span>Solana + Token-2022</span><span>Auditable evidence</span></div></div>
    <div className="hero-visual"><div className="hero-visual-chrome"><span><i className="status-dot"/>Operational network</span><span className="hero-visual-badge">Light / Dark ready</span></div><img src="/assets/relief-network-hero.svg" alt="PowerChain Relief Network product illustration"/></div>
  </section>
  <section id="product" className="section section-muted"><div className="shell product-preview"><div><span className="eyebrow">PRODUCT PREVIEW</span><h2>One operating surface from network truth to verified impact.</h2><p>Inspect Solana state, deployment integrity, provider health and asset intelligence while keeping secrets, signatures and authoritative controls server-side.</p><a className="text-link" href="/solana">Open Solana operations →</a></div><div className="preview-card"><div className="preview-head"><span>Operational state</span><b>Source-aware</b></div><div className="preview-grid"><div><small>NETWORK</small><strong>Solana</strong><span>Cluster + genesis verification</span></div><div><small>PROGRAMS</small><strong>Verified</strong><span>Executable + fingerprint checks</span></div><div><small>MARKETS</small><strong>Bounded</strong><span>Provider priority + freshness</span></div><div><small>EVIDENCE</small><strong>Auditable</strong><span>Release + reconciliation trail</span></div></div></div></div></section>
  <DashboardPreview />
  <Features />
  <TrustArchitecture />
  <ProviderArchitecture />
  <PartnerStrip />
  <Partnership />
  <FAQ />
  <CTA />
  <SiteFooter />
</main>}
