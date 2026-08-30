const providers=[
 ["Solana RPC","Authoritative","Balances · supply · programs · transactions"],
 ["Helius","Index + RPC","DAS assets · metadata · configured RPC lane"],
 ["Pyth","Oracle","Price + confidence + publish time"],
 ["Jupiter","Market","Price V3 + liquidity enrichment"],
 ["Birdeye","Market","Price + liquidity observation"],
 ["CoinGecko","Market","Price · volume · market cap enrichment"],
];
export function ProviderArchitecture(){
 return <section className="section section-muted"><div className="shell">
   <div className="section-head-row"><div><span className="eyebrow">DATA PROVENANCE</span><h2 className="section-title">Every provider has a bounded role.</h2></div><a className="text-link" href="/network">Inspect network architecture →</a></div>
   <div className="provider-architecture-grid">{providers.map(([name,role,body])=><article key={name}><span>{role}</span><h3>{name}</h3><p>{body}</p></article>)}</div>
   <p className="provider-boundary"><b>Authority boundary:</b> market providers enrich analytics; they do not override Solana RPC supply, balances, program identity or settlement truth.</p>
 </div></section>
}
