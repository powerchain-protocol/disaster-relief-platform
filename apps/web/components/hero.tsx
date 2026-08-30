import { ArrowRightIcon, BarChartIcon, CheckCircledIcon, GlobeIcon, LockClosedIcon, TokensIcon } from "@radix-ui/react-icons";

export function Hero(){
  return <section className="reference-hero globe-chain-hero">
    <div className="shell reference-hero-grid">
      <div className="reference-hero-copy">
        <span className="reference-pill">SOLANA · TOKEN-2022 · REAL WORLD IMPACT</span>
        <h1>Powering Relief.<br/><span>Restoring Hope.</span></h1>
        <p>PowerChain Relief Network is verified capital infrastructure for emergency response—connecting funding, deterministic policy, Solana settlement and evidence while keeping authorization, execution and verified impact distinct.</p>
        <div className="reference-hero-actions">
          <a className="button reference-primary" href="/solana">Launch App <ArrowRightIcon/></a>
          <a className="button reference-secondary" href="/solana">View Dashboard <BarChartIcon/></a>
        </div>
      </div>

      <div className="globe-chain-architecture" aria-label="PowerChain Relief globe and settlement architecture">
        <div className="globe-chain-grid" aria-hidden="true"/>
        <div className="globe-chain-orbit orbit-one" aria-hidden="true"/>
        <div className="globe-chain-orbit orbit-two" aria-hidden="true"/>
        <div className="globe-chain-base base-one" aria-hidden="true"/>
        <div className="globe-chain-base base-two" aria-hidden="true"/>

        <div className="globe-shell" aria-hidden="true">
          <div className="globe-latitude lat-one"/>
          <div className="globe-latitude lat-two"/>
          <div className="globe-longitude long-one"/>
          <div className="globe-longitude long-two"/>
          <div className="globe-continent continent-a"/>
          <div className="globe-continent continent-b"/>
          <div className="globe-continent continent-c"/>
        </div>

        <div className="chain-node node-policy"><LockClosedIcon/><span><b>Policy</b><small>Roles + approvals</small></span></div>
        <div className="chain-node node-network"><TokensIcon/><span><b>Settlement</b><small>Solana + Token-2022</small></span></div>
        <div className="chain-node node-impact"><GlobeIcon/><span><b>Impact</b><small>Evidence-backed</small></span></div>

        <div className="chain-link link-policy" aria-hidden="true"><span/></div>
        <div className="chain-link link-network" aria-hidden="true"><span/></div>
        <div className="chain-link link-impact" aria-hidden="true"><span/></div>

        <article className="hero-architecture-card card-transparency">
          <div><span>ON-CHAIN TRANSPARENCY</span><CheckCircledIcon/></div>
          <small>Program + settlement state</small>
          <strong>Source-aware</strong>
          <p>Verified against Solana RPC.</p>
        </article>

        <article className="hero-architecture-card card-impact">
          <div><span>REAL WORLD IMPACT</span><GlobeIcon/></div>
          <small>Evidence state</small>
          <strong>Independent</strong>
          <p>Delivery ≠ verified impact.</p>
        </article>

        <article className="hero-architecture-card card-funding">
          <div><span>RELIEF FUNDING</span><TokensIcon/></div>
          <small>Capital controls</small>
          <strong>Policy-bound</strong>
          <p>Release only after review.</p>
        </article>

        <div className="globe-chain-caption"><span>POSTGRES · OPERATIONAL TRUTH</span><i/><span>SOLANA · SETTLEMENT TRUTH</span></div>
      </div>
    </div>

    <div className="shell reference-metric-strip">
      <div><span className="metric-icon">♥</span><p><b>$0+</b><small>Relief Deployed</small></p></div>
      <div><span className="metric-icon">◎</span><p><b>0+</b><small>Communities Helped</small></p></div>
      <div><span className="metric-icon">✓</span><p><b>100%</b><small>Source-labelled</small></p></div>
      <div><span className="metric-icon">◉</span><p><b>24/7</b><small>Global Network</small></p></div>
    </div>
  </section>
}
