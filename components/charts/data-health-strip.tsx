import type { ProviderHealthDatum } from "../../types/charts";

function label(mode:ProviderHealthDatum["mode"]){return mode==="DEMO"?"DEMO DATA":mode;}
export function DataHealthStrip({title="Data sources",providers}:{title?:string;providers:ProviderHealthDatum[]}){
  return <section className="pc-data-health" aria-label={title}>
    <header><span>DATA HEALTH</span><h3>{title}</h3></header>
    <div className="pc-data-health-grid">{providers.map(provider=><article key={provider.id} className={`pc-provider pc-provider-${provider.mode.toLowerCase()}${provider.stale?" is-stale":""}`}>
      <div className="pc-provider-heading"><i aria-hidden="true"/><b>{provider.label}</b><strong>{provider.stale?"STALE":label(provider.mode)}</strong></div>
      {provider.source?<span>{provider.source}</span>:null}
      <dl>{provider.updatedAt?<><dt>Updated</dt><dd>{provider.updatedAt}</dd></>:null}{provider.latencyMs!=null?<><dt>Latency</dt><dd>{provider.latencyMs} ms</dd></>:null}</dl>
      {provider.detail?<p>{provider.detail}</p>:null}
    </article>)}</div>
  </section>;
}
