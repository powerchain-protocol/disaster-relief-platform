export type DataMode = "LIVE"|"DEMO"|"STATIC"|"DEGRADED"|"TBA"|"UNAVAILABLE";
export type NumericPoint = { label:string; value:number };

export function assertFiniteSeries(points:NumericPoint[]) {
  if (!points.length) throw new Error("CHART_SERIES_EMPTY");
  for (const point of points) {
    if (!point.label.trim()) throw new Error("CHART_POINT_LABEL_REQUIRED");
    if (!Number.isFinite(point.value)) throw new Error("CHART_POINT_VALUE_INVALID");
  }
  return points;
}

export function sourcePresentation(input:{mode:DataMode;source?:string;stale?:boolean;updatedAt?:string;freshnessSeconds?:number;nowMs?:number}) {
  const now = input.nowMs ?? Date.now();
  const ageStale = Boolean(input.updatedAt && input.freshnessSeconds != null && Number.isFinite(Date.parse(input.updatedAt)) && now - Date.parse(input.updatedAt) > input.freshnessSeconds * 1000);
  const stale = Boolean(input.stale || ageStale);
  if (input.mode === "LIVE" && !input.source) return {mode:"UNAVAILABLE" as const,label:"SOURCE REQUIRED",canRenderValues:false,stale:false};
  if (stale && input.mode === "LIVE") return {mode:"DEGRADED" as const,label:"STALE DATA",canRenderValues:true,stale:true};
  return {mode:input.mode,label:input.mode === "DEMO"?"DEMO DATA":input.mode,canRenderValues:input.mode!=="UNAVAILABLE"&&input.mode!=="TBA",stale};
}

export function monotonicCapitalCheck(values:{raised:number;allocated:number;released?:number;verified:number}) {
  const reasons:string[]=[];
  if (values.allocated > values.raised) reasons.push("ALLOCATED_EXCEEDS_RAISED");
  if (values.released != null && values.released > values.allocated) reasons.push("RELEASED_EXCEEDS_ALLOCATED");
  if (values.verified > (values.released ?? values.allocated)) reasons.push("VERIFIED_EXCEEDS_PREVIOUS_FINANCIAL_STAGE");
  return {valid:reasons.length===0,reasons};
}

export function seriesDelta(points:NumericPoint[]) {
  assertFiniteSeries(points);
  if (points.length < 2) return {absolute:0,percent:0};
  const first=points[0].value, last=points[points.length-1].value;
  const absolute=last-first;
  return {absolute,percent:first===0?0:(absolute/Math.abs(first))*100};
}

export function niceTicks(min:number,max:number,count=5) {
  if (!Number.isFinite(min)||!Number.isFinite(max)||count<2) throw new Error("CHART_AXIS_INVALID");
  if (max < min) [min,max]=[max,min];
  if (max===min) return Array.from({length:count},(_,i)=>min+i);
  const raw=(max-min)/(count-1); const power=10**Math.floor(Math.log10(raw)); const normalized=raw/power;
  const step=(normalized<=1?1:normalized<=2?2:normalized<=5?5:10)*power;
  const start=Math.floor(min/step)*step; const ticks:number[]=[];
  for(let v=start;ticks.length<count+2&&v<=max+step;v+=step) if(v>=min-step*0.001) ticks.push(Number(v.toPrecision(12)));
  return ticks.length>=2?ticks:Array.from({length:count},(_,i)=>min+((max-min)*i)/(count-1));
}
