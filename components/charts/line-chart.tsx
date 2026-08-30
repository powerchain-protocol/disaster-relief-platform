import type { ChartSourceMeta, LineSeries, LineSeriesPoint } from "../../types/charts";

type Props = {
  title: string;
  series: LineSeries[];
  data?: ChartSourceMeta;
  unit?: string;
  height?: number;
  includeZero?: boolean;
  valueFormatter?: (value:number)=>string;
};

const stateClass = (state?: string) => `pc-line-series pc-line-${state ?? "neutral"}`;
const safePoints=(points:LineSeriesPoint[])=>points.filter(point=>Number.isFinite(point.y));
const defaultFormat=(value:number,unit:string)=>`${value.toLocaleString(undefined,{maximumFractionDigits:value>=10?0:2})}${unit}`;

function latestDelta(points:LineSeriesPoint[]) {
  const values=safePoints(points);
  if(!values.length) return null;
  const latest=values[values.length-1];
  if(values.length<2) return {latest,absolute:0,percent:0};
  const previous=values[values.length-2];
  const absolute=latest.y-previous.y;
  return {latest,absolute,percent:previous.y===0?0:(absolute/Math.abs(previous.y))*100};
}

export function LineChart({ title, series, data, unit = "", height = 260, includeZero = true, valueFormatter }: Props) {
  const validSeries=series.map(s=>({...s,points:safePoints(s.points)})).filter(s=>s.points.length>0);
  const all = validSeries.flatMap(s => s.points.map(p => p.y));
  const rawMax = Math.max(...all, 1);
  const rawMin = Math.min(...all, 0);
  const max = rawMax===rawMin?rawMax+1:rawMax;
  const min = includeZero && rawMin>0 ? 0 : rawMin;
  const span = Math.max(max - min, 1);
  const w = 760, h = height, left = 62, right = 22, top = 30, bottom = 52;
  const innerW = w - left - right, innerH = h - top - bottom;
  const count = Math.max(...validSeries.map(s => s.points.length), 2);
  const x = (i:number) => left + (i/(count-1))*innerW;
  const y = (v:number) => top + ((max-v)/span)*innerH;
  const grid = Array.from({length:5},(_,i)=>max-(span*i/4));
  const format=(value:number)=>valueFormatter?valueFormatter(value):defaultFormat(value,unit);
  const badge=data?.mode === "DEMO"?"DEMO DATA":data?.mode;
  const noData=!validSeries.length || data?.mode==="UNAVAILABLE" || data?.mode==="TBA";
  return <figure className="pc-line-chart" aria-label={title}>
    <figcaption><div><span>DATA</span><h3>{title}</h3></div>{data?<b className={`pc-data-badge pc-data-${data.mode.toLowerCase()}`}>{badge}</b>:null}</figcaption>
    {noData?<div className="pc-chart-empty" role="status"><b>{data?.mode ?? "UNAVAILABLE"}</b><span>{data?.note ?? "No chart values are available from an authoritative source."}</span></div>:<>
      <div className="pc-chart-summary" aria-label="Latest series values">
        {validSeries.map(s=>{const d=latestDelta(s.points)!;return <div key={s.id} className={stateClass(s.state)}><span className="pc-chart-legend-line"/><span>{s.label}</span><b>{format(d.latest.y)}</b><em className={d.absolute>0?"is-up":d.absolute<0?"is-down":"is-flat"}>{d.absolute===0?"—":`${d.absolute>0?"+":""}${d.percent.toFixed(1)}%`}</em></div>})}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${title}. ${validSeries.map(s=>`${s.label}: ${s.points.map(p=>`${p.x} ${format(p.y)}`).join(", ")}`).join(". ")}`}>
        {grid.map((g,i)=><g key={`${g}-${i}`}><line className="pc-chart-grid" x1={left} x2={w-right} y1={y(g)} y2={y(g)}/><text className="pc-chart-axis" x={left-10} y={y(g)+4} textAnchor="end">{format(g)}</text></g>)}
        {validSeries[0]?.points.map((p,i)=>{
          const show=validSeries[0].points.length<=7||i===0||i===validSeries[0].points.length-1||i%Math.ceil(validSeries[0].points.length/6)===0;
          return show?<text key={`${p.x}-${i}`} className="pc-chart-axis" x={x(i)} y={h-18} textAnchor="middle">{p.x}</text>:null;
        })}
        {validSeries.map(s=>{
          const d=s.points.map((p,i)=>`${i===0?"M":"L"} ${x(i)} ${y(p.y)}`).join(" ");
          return <g key={s.id} className={`${stateClass(s.state)}${s.lineStyle==="dashed"?" is-dashed":""}`}><path className="pc-chart-line" d={d}/>{s.showPoints!==false?s.points.map((p,i)=><circle key={`${p.x}-${i}`} className={`pc-chart-point pc-point-${p.quality??"verified"}`} cx={x(i)} cy={y(p.y)} r={p.quality==="estimated"?3.5:4}><title>{`${s.label}: ${p.x} ${format(p.y)}${p.note?` · ${p.note}`:""}`}</title></circle>):null}</g>
        })}
      </svg>
      <table className="pc-chart-data-table"><caption>{title} data table</caption><thead><tr><th>Series</th><th>Point</th><th>Value</th><th>Quality</th></tr></thead><tbody>{validSeries.flatMap(s=>s.points.map(p=><tr key={`${s.id}-${p.x}`}><th>{s.label}</th><td>{p.x}</td><td>{format(p.y)}</td><td>{p.quality??"verified"}</td></tr>))}</tbody></table>
    </>}
    {data?<small className="pc-chart-source">Source: {data.source}{data.sourceId?` · ${data.sourceId}`:""}{data.observedAt?` · Observed ${data.observedAt}`:""}{data.updatedAt?` · Updated ${data.updatedAt}`:""}{data.freshnessSeconds!=null?` · ${data.freshnessSeconds}s freshness`:""}{data.stale?" · STALE":""}</small>:null}
    {data?.note?<p className="pc-chart-note">{data.note}</p>:null}
  </figure>;
}
