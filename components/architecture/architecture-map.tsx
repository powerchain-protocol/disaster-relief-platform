import type { ArchitectureEdge, ArchitectureNode, ChartSemanticState, ChartSourceMeta } from "../../types/charts";

const stateClass=(state?:ChartSemanticState)=>`pc-architecture-${state??"neutral"}`;
const markerId=(state?:ChartSemanticState)=>`pc-arch-arrow-${state??"neutral"}`;
const nodeClipId=(id:string)=>`pc-arch-node-clip-${id.replace(/[^a-zA-Z0-9_-]/g,"-")}`;

function nodeCenter(node:ArchitectureNode){return{x:node.x+(node.width??180)/2,y:node.y+(node.height??82)/2};}
function badgeWidth(status:string,nodeWidth:number){return Math.min(nodeWidth-24,Math.max(62,20+status.length*6.2));}
function wrapWords(text:string,maxChars:number,maxLines=2){
  if(text.length<=maxChars)return[text];
  const words=text.split(/\s+/);const lines:string[]=[];let current="";
  for(const word of words){const candidate=`${current} ${word}`.trim();if(candidate.length<=maxChars||!current){current=candidate;continue;}lines.push(current);current=word;if(lines.length===maxLines-1)break;}
  if(lines.length<maxLines&&current){const consumed=lines.join(" ").split(/\s+/).filter(Boolean).length;let rest=words.slice(consumed).join(" ");if(rest.length>maxChars)rest=`${rest.slice(0,Math.max(1,maxChars-1)).trim()}…`;lines.push(rest);}
  return lines.slice(0,maxLines);
}

type EdgeGeometry={d:string;labelX:number;labelY:number};
function edgeGeometry(from:ArchitectureNode,to:ArchitectureNode,route:ArchitectureEdge["route"]="orthogonal"):EdgeGeometry{
  const a=nodeCenter(from),b=nodeCenter(to);const fw=from.width??180,fh=from.height??82,tw=to.width??180,th=to.height??82;
  const horizontal=Math.abs(b.x-a.x)>=Math.abs(b.y-a.y);
  if(route==="vertical"||(!horizontal&&route!=="horizontal")){
    const down=b.y>=a.y;const sy=a.y+(down?fh/2:-fh/2),ey=b.y+(down?-th/2:th/2),my=(sy+ey)/2;
    if(Math.abs(a.x-b.x)<1)return{d:`M ${a.x} ${sy} V ${ey}`,labelX:a.x,labelY:my-8};
    return{d:`M ${a.x} ${sy} V ${my} H ${b.x} V ${ey}`,labelX:(a.x+b.x)/2,labelY:my-8};
  }
  const right=b.x>=a.x;const sx=a.x+(right?fw/2:-fw/2),ex=b.x+(right?-tw/2:tw/2);
  if(route==="horizontal"||Math.abs(a.y-b.y)<1)return{d:`M ${sx} ${a.y} H ${ex}`,labelX:(sx+ex)/2,labelY:a.y-10};
  const mx=(sx+ex)/2;
  return{d:`M ${sx} ${a.y} H ${mx} V ${b.y} H ${ex}`,labelX:mx,labelY:(a.y+b.y)/2-8};
}

export function ArchitectureMap({title,nodes,edges,data,width=980,height=520}:{title:string;nodes:ArchitectureNode[];edges:ArchitectureEdge[];data?:ChartSourceMeta;width?:number;height?:number}){
  const byId=new Map(nodes.map(node=>[node.id,node]));
  const describedBy=`architecture-${title.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-description`;
  return <figure className="pc-architecture-map" aria-labelledby={`${describedBy}-title`} aria-describedby={describedBy}>
    <figcaption><div><span>ARCHITECTURE</span><h3 id={`${describedBy}-title`}>{title}</h3></div>{data?<b className={`pc-data-badge pc-data-${data.mode.toLowerCase()}`}>{data.mode==="DEMO"?"DEMO DATA":data.mode}</b>:null}</figcaption>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
      <defs>
        {(["neutral","capital","utility","trust","risk","warning"] as ChartSemanticState[]).map(state=><marker key={state} id={markerId(state)} viewBox="0 0 10 10" refX="8.7" refY="5" markerWidth="7" markerHeight="7" orient="auto" markerUnits="strokeWidth"><path d="M1 1 L9 5 L1 9 Z" className={`pc-architecture-arrow ${stateClass(state)}`}/></marker>)}
        {nodes.map(node=><clipPath key={node.id} id={nodeClipId(node.id)}><rect x="1" y="1" width={(node.width??180)-2} height={(node.height??82)-2} rx="12"/></clipPath>)}
      </defs>
      <g className="pc-architecture-edges">{edges.map(edge=>{const from=byId.get(edge.from),to=byId.get(edge.to);if(!from||!to)return null;const geometry=edgeGeometry(from,to,edge.route);const labelWidth=edge.label?Math.min(126,Math.max(58,18+edge.label.length*5.6)):0;return <g key={edge.id} className={`${stateClass(edge.state)}${edge.dashed?" is-dashed":""}`}><path d={geometry.d} markerEnd={`url(#${markerId(edge.state)})`}/>{edge.label?<g className="pc-architecture-edge-label"><rect x={geometry.labelX-labelWidth/2} y={geometry.labelY-11} width={labelWidth} height="18" rx="7"/><text x={geometry.labelX} y={geometry.labelY+2} textAnchor="middle">{edge.label}</text></g>:null}</g>})}</g>
      <g className="pc-architecture-nodes">{nodes.map(node=>{const w=node.width??180,h=node.height??82;const statusW=node.status?badgeWidth(String(node.status),w):0;const titleY=node.status?47:27;const titleLines=wrapWords(node.label,Math.max(11,Math.floor((w-30)/7)),node.status?1:2);const valueY=titleY+22*titleLines.length;const detailY=node.value?valueY+19:titleY+20*titleLines.length;const detailLines=node.detail?wrapWords(node.detail,Math.max(16,Math.floor((w-30)/6.2)),2):[];return <g key={node.id} transform={`translate(${node.x} ${node.y})`} className={stateClass(node.state)} data-node-width={w} data-node-height={h}><rect width={w} height={h} rx="13"/><g clipPath={`url(#${nodeClipId(node.id)})`}>{node.status?<g className="pc-architecture-status" transform={`translate(${w-statusW-12} 10)`}><rect width={statusW} height="20" rx="10"/><text x={statusW/2} y="13" textAnchor="middle">{node.status}</text></g>:null}<text className="pc-architecture-node-title" x="16" y={titleY}>{titleLines.map((line,index)=><tspan key={`${node.id}-title-${index}`} x="16" dy={index===0?0:15}>{line}</tspan>)}</text>{node.value?<text className="pc-architecture-node-value" x="16" y={valueY}>{node.value}</text>:null}{detailLines.length?<text className="pc-architecture-node-detail" x="16" y={detailY}>{detailLines.map((line,index)=><tspan key={`${node.id}-detail-${index}`} x="16" dy={index===0?0:13}>{line}</tspan>)}</text>:null}</g></g>})}</g>
    </svg>
    <div id={describedBy} className="pc-architecture-fallback"><ol>{nodes.map(node=><li key={node.id}><b>{node.label}</b>{node.detail?` — ${node.detail}`:""}{node.status?` [${node.status}]`:""}</li>)}</ol><ul>{edges.map(edge=><li key={edge.id}>{byId.get(edge.from)?.label ?? edge.from} → {byId.get(edge.to)?.label ?? edge.to}{edge.label?`: ${edge.label}`:""}</li>)}</ul></div>
    {data?<small className="pc-architecture-source">Source: {data.source}{data.sourceId?` · ${data.sourceId}`:""}{data.updatedAt?` · Updated ${data.updatedAt}`:""}{data.stale?" · STALE":""}</small>:null}
  </figure>;
}
