const names = ["Solana", "Helius", "Pyth", "Circle", "Jupiter", "Metaplex", "AWS", "Cloudflare"];

export function PartnerStrip() {
  return <section className="partner-strip-section" aria-label="Technology ecosystem">
    <div className="shell">
      <p>Infrastructure and ecosystem integrations</p>
      <div className="partner-strip">{names.map(name => <span key={name}>{name}</span>)}</div>
    </div>
  </section>;
}
