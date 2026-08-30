import type { ArchitectureEdge, ArchitectureNode, ChartSourceMeta, FlowEdgeData, FlowNodeData, LineSeries } from "../types/charts";

export const chartDesign = {
  connectorWidth: 2,
  connectorWidthStrong: 2.5,
  arrowHeadSize: 8,
  connectorRadius: 10,
  gridLineOpacity: 0.55,
  mobileBreakpoint: 760,
  sourceMetaPosition: "footer",
} as const;

export const nepalFloodDemoSource: ChartSourceMeta = {
  mode: "DEMO",
  source: "Nepal Flood Response product fixture",
  sourceId: "fixture:nepal-flood-response",
  stale: false,
  note: "Demo only. Production requires authoritative live sources or an explicit unavailable state.",
};

export const nepalFloodCapitalNodes: FlowNodeData[] = [
  { id: "raised", label: "Raised", detail: "settled funding", value: "$4.28M", state: "capital" },
  { id: "allocated", label: "Allocated", detail: "purpose-bound", value: "$3.71M", state: "capital" },
  { id: "escrow", label: "Escrow", detail: "policy locked", value: "$770K", state: "warning" },
  { id: "verified", label: "Verified impact", detail: "evidence linked", value: "$2.94M", state: "trust" },
];

export const nepalFloodCapitalEdges: FlowEdgeData[] = [
  { from:"raised",to:"allocated",label:"86.7% allocated",state:"capital" },
  { from:"allocated",to:"escrow",label:"20.8% held",state:"warning" },
  { from:"escrow",to:"verified",label:"evidence + reconciliation",state:"trust" },
];

export const nepalFloodCapitalSeries: LineSeries[] = [
  {
    id: "capital-progress",
    label: "Capital progression",
    state: "capital",
    showPoints: true,
    points: [
      { x: "Raised", y: 4.28, quality:"verified" },
      { x: "Allocated", y: 3.71, quality:"verified" },
      { x: "Released", y: 3.18, quality:"verified" },
      { x: "Delivered", y: 3.02, quality:"estimated", note:"Demo operational fixture" },
      { x: "Verified", y: 2.94, quality:"verified" },
    ],
  },
];

export const capitalLifecycleNodes: FlowNodeData[] = [
  { id: "need", label: "Need", detail: "verified requirement", state: "risk" },
  { id: "fund", label: "Fund", detail: "settled capital", state: "capital" },
  { id: "allocate", label: "Allocate", detail: "purpose policy", state: "capital" },
  { id: "escrow", label: "Protect", detail: "escrow + approvals", state: "warning" },
  { id: "deliver", label: "Respond", detail: "procurement + delivery", state: "neutral" },
  { id: "prove", label: "Prove", detail: "evidence + impact", state: "trust" },
  { id: "audit", label: "Audit", detail: "reconciled trail", state: "trust" },
];

export const sourceOfTruthArchitecture: {nodes:ArchitectureNode[];edges:ArchitectureEdge[];data:ChartSourceMeta} = {
  data:{mode:"STATIC",source:"PowerChain reconciliation architecture v1.0.0",sourceId:"architecture:source-of-truth"},
  nodes:[
    {id:"intent",label:"Quote / intent",detail:"hash + policy binding",x:40,y:42,width:180,height:84},
    {id:"wallet",label:"Wallet signature",detail:"authorized actor",x:270,y:42,width:180,height:84,state:"trust"},
    {id:"submitted",label:"Submitted tx",detail:"signature known",x:500,y:42,width:180,height:84,state:"capital"},
    {id:"rpc",label:"Authoritative RPC",detail:"chain evidence",x:730,y:42,width:205,height:84,state:"trust"},
    {id:"reconcile",label:"Reconciliation Engine",detail:"program · signer · destination · amount · slot",x:355,y:210,width:280,height:98,state:"utility"},
    {id:"ledger",label:"Ledger / Audit / Impact",detail:"advance only after verified state",x:365,y:380,width:260,height:84,state:"trust"},
  ],
  edges:[
    {id:"e1",from:"intent",to:"wallet",label:"authorize",state:"neutral"},
    {id:"e2",from:"wallet",to:"submitted",label:"submit",state:"capital"},
    {id:"e3",from:"submitted",to:"rpc",label:"confirm",state:"trust"},
    {id:"e4",from:"rpc",to:"reconcile",label:"parsed tx",state:"trust",route:"orthogonal"},
    {id:"e5",from:"reconcile",to:"ledger",label:"verified transition",state:"trust",route:"vertical"},
  ],
};
