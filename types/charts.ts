export type ChartDataMode = "LIVE" | "DEMO" | "STATIC" | "DEGRADED" | "TBA" | "UNAVAILABLE";
export type ChartSemanticState = "capital" | "utility" | "trust" | "risk" | "warning" | "neutral";
export type ChartLineStyle = "solid" | "dashed";
export type PointQuality = "verified" | "estimated" | "stale" | "missing";

export type ChartSourceMeta = {
  mode: ChartDataMode;
  source: string;
  sourceId?: string;
  observedAt?: string;
  updatedAt?: string;
  freshnessSeconds?: number;
  stale?: boolean;
  note?: string;
};

export type FlowNodeData = {
  id: string;
  label: string;
  detail?: string;
  value?: string;
  state?: ChartSemanticState;
  badge?: string;
};

export type FlowEdgeData = {
  from: string;
  to: string;
  label?: string;
  state?: ChartSemanticState;
  dashed?: boolean;
};

export type LineSeriesPoint = {
  x: string;
  y: number;
  quality?: PointQuality;
  note?: string;
};

export type LineSeries = {
  id: string;
  label: string;
  state?: ChartSemanticState;
  lineStyle?: ChartLineStyle;
  showPoints?: boolean;
  directional?: boolean;
  points: LineSeriesPoint[];
};

export type ArchitectureNode = {
  id: string;
  label: string;
  detail?: string;
  value?: string;
  state?: ChartSemanticState;
  status?: ChartDataMode | "VERIFIED" | "REVIEW" | "BLOCKED";
  x: number;
  y: number;
  width?: number;
  height?: number;
};

export type ArchitectureEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  state?: ChartSemanticState;
  dashed?: boolean;
  route?: "horizontal" | "vertical" | "orthogonal";
};

export type ProviderHealthDatum = {
  id: string;
  label: string;
  mode: ChartDataMode;
  source?: string;
  updatedAt?: string;
  latencyMs?: number;
  stale?: boolean;
  detail?: string;
};
