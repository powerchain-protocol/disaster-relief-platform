import type { ChartDataMode, ChartSemanticState, ChartSourceMeta, FlowEdgeData, FlowNodeData } from "../types/charts";
import { nepalFloodCapitalEdges, nepalFloodCapitalNodes, nepalFloodDemoSource } from "../data/architecture";

export type FlowStep = FlowNodeData & {
  edgeLabel?: string;
  edgeState?: ChartSemanticState;
  dashedEdge?: boolean;
};

function statusLabel(mode: ChartDataMode) {
  return mode === "DEMO" ? "DEMO DATA" : mode;
}

function sourceSummary(data: ChartSourceMeta) {
  const parts=[data.source];
  if(data.sourceId) parts.push(data.sourceId);
  if(data.observedAt) parts.push(`Observed ${data.observedAt}`);
  if(data.updatedAt) parts.push(`Updated ${data.updatedAt}`);
  if(data.freshnessSeconds != null) parts.push(`Freshness ${data.freshnessSeconds}s`);
  if(data.stale) parts.push("STALE");
  return parts.join(" · ");
}

function FlowConnector({ label, dashed = false, state = "neutral", index }: { label?: string; dashed?: boolean; state?: ChartSemanticState; index:number }) {
  const markerId=`pc-flow-arrow-${state}-${index}`;
  return (
    <div className={`pc-flow-connector pc-flow-edge-${state}${dashed ? " is-dashed" : ""}`}>
      <span className="pc-sr-only">Then{label ? `: ${label}` : ""}</span>
      {label ? <small aria-hidden="true">{label}</small> : null}
      <svg viewBox="0 0 96 34" preserveAspectRatio="none" focusable="false" aria-hidden="true">
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path className="pc-flow-arrowhead" d="M 1 1 L 9 5 L 1 9 Z" />
          </marker>
        </defs>
        <path className="pc-flow-edge-path" d="M2 17 H84" markerEnd={`url(#${markerId})`} />
      </svg>
    </div>
  );
}

function stepsFromGraph(nodes:FlowNodeData[],edges:FlowEdgeData[]):FlowStep[] {
  return nodes.map((node,index)=>{
    const edge=edges.find(item=>item.from===node.id && item.to===nodes[index+1]?.id);
    return {...node,edgeLabel:edge?.label,edgeState:edge?.state,dashedEdge:edge?.dashed};
  });
}

export function FlowChart({
  title,
  steps,
  note,
  data,
}: {
  title: string;
  steps: FlowStep[];
  note?: string;
  data?: ChartSourceMeta;
}) {
  const metaId = `flow-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-meta`;
  return (
    <section className="pc-flow" aria-label={title} aria-describedby={data || note ? metaId : undefined}>
      <header className="pc-flow-header">
        <div><span>FLOW</span><h3>{title}</h3></div>
        {data ? <b className={`pc-data-badge pc-data-${data.mode.toLowerCase()}`}>{statusLabel(data.mode)}</b> : null}
      </header>
      <ol className="pc-flow-steps">
        {steps.map((step, index) => (
          <li className="pc-flow-segment" key={step.id ?? `${step.label}-${index}`}>
            <article className={`pc-flow-step pc-flow-${step.state ?? "neutral"}`}>
              <span className="pc-flow-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="pc-flow-copy">
                <div className="pc-flow-title-row"><b>{step.label}</b>{step.badge ? <em>{step.badge}</em> : null}</div>
                {step.value ? <strong>{step.value}</strong> : null}
                {step.detail ? <small>{step.detail}</small> : null}
              </div>
            </article>
            {index < steps.length - 1 ? <FlowConnector label={step.edgeLabel} dashed={step.dashedEdge} state={step.edgeState ?? step.state} index={index} /> : null}
          </li>
        ))}
      </ol>
      {(data || note) ? <footer id={metaId} className="pc-flow-meta">
        {data ? <span><b>Source</b> {sourceSummary(data)}</span> : null}
        {data?.note ? <p>{data.note}</p> : null}
        {note ? <p>{note}</p> : null}
      </footer> : null}
    </section>
  );
}

export function FeeStackFlow() {
  return <FlowChart title="Funding review" steps={[
    { id:"principal", label: "Principal", detail: "crisis capital", state: "capital", edgeLabel:"quote", edgeState:"capital" },
    { id:"service", label: "Service fee", detail: "only if configured", dashedEdge:true, edgeLabel:"optional", edgeState:"neutral" },
    { id:"transfer", label: "Token transfer fee", detail: "asset-specific", dashedEdge:true, edgeLabel:"optional", edgeState:"neutral" },
    { id:"network", label: "Network fee", detail: "Solana estimate", edgeLabel:"estimate", edgeState:"warning" },
    { id:"provider", label: "Provider fee", detail: "only if rail applies", dashedEdge:true, edgeLabel:"optional", edgeState:"neutral" },
    { id:"authorize", label: "Authorize", detail: "wallet / payment provider", state: "trust" },
  ]} data={{mode:"STATIC",source:"PowerChain fee model v1.0.0",sourceId:"fees:v1"}} note="The 5% successful-funding commission is a separate post-success proceeds rule, not a hidden contributor checkout charge." />;
}

export function PwrcVsCapitalFlow() {
  return <div className="pc-flow-grid">
    <FlowChart title="Crisis capital" steps={[
      { id:"asset", label: "USDC / SOL", state: "capital", edgeLabel:"settle", edgeState:"capital" },
      { id:"pool", label: "Pool", edgeLabel:"policy", edgeState:"neutral" },
      { id:"allocation", label: "Allocation", edgeLabel:"reserve", edgeState:"warning" },
      { id:"escrow", label: "Escrow", edgeLabel:"release", edgeState:"trust" },
      { id:"impact", label: "Impact", state: "trust" },
    ]} data={{mode:"STATIC",source:"CCN capital lifecycle v1.0.0",sourceId:"ccn:capital-lifecycle"}} />
    <FlowChart title="PWRC utility" steps={[
      { id:"pwrc", label: "PWRC", state: "utility", edgeLabel:"meter", edgeState:"utility" },
      { id:"units", label: "Power Units", edgeLabel:"consume", edgeState:"utility" },
      { id:"services", label: "AI / API", edgeLabel:"participate", edgeState:"neutral" },
      { id:"participation", label: "Participation", edgeLabel:"review", edgeState:"trust" },
      { id:"rewards", label: "Rewards", state: "trust" },
    ]} data={{mode:"STATIC",source:"PWRC Utility Architecture v1.0.0",sourceId:"pwrc:utility-v1"}} />
  </div>;
}

export function NepalDemoCapitalFlow() {
  return <FlowChart title="Nepal Flood Response capital progression" steps={stepsFromGraph(nepalFloodCapitalNodes,nepalFloodCapitalEdges)} data={nepalFloodDemoSource} />;
}
