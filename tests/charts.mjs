import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),"utf8");
const types=read("types/charts.ts");
assert.match(types,/"UNAVAILABLE"/);
assert.match(types,/PointQuality/);
assert.match(types,/ArchitectureEdge/);
assert.match(types,/sourceId\?/);
assert.match(types,/freshnessSeconds\?/);

const flow=read("components/flow-charts.tsx");
assert.match(flow,/markerEnd/);
assert.match(flow,/edgeState/);
assert.match(flow,/pc-sr-only/);
assert.match(flow,/nepalFloodCapitalEdges/);

const line=read("components/charts/line-chart.tsx");
assert.match(line,/pc-chart-summary/);
assert.match(line,/pc-chart-data-table/);
assert.match(line,/quality/);
assert.match(line,/UNAVAILABLE/);

const architecture=read("components/architecture/architecture-map.tsx");
assert.match(architecture,/route===\"vertical\"/);
assert.match(architecture,/markerEnd/);
assert.match(architecture,/pc-architecture-fallback/);
assert.match(architecture,/edge\.state/);
assert.match(architecture,/badgeWidth/);
assert.match(architecture,/clipPath/);
assert.match(architecture,/edgeGeometry/);

const grammar=JSON.parse(read("config/architecture-data.json"));
assert.equal(grammar.visualGrammar.connectorStyle,"ORTHOGONAL");
assert.equal(grammar.visualGrammar.edgeLabels,true);
assert.equal(grammar.visualGrammar.edgeStateIndependentFromNodeState,true);
assert.equal(grammar.visualGrammar.sourceMetadataFooter,true);
assert.ok(grammar.statusVocabulary.includes("UNAVAILABLE"));

const architectureDir=resolve(new URL("../public/images/architectures",import.meta.url).pathname);
for(const name of readdirSync(architectureDir).filter(name=>name.endsWith(".svg"))){
  const file=resolve(architectureDir,name);
  const svg=readFileSync(file,"utf8");
  assert.match(svg,/marker-end:url\(#a\)/,`${file} must use arrowheads`);
  assert.match(svg,/class="node-card"/,`${file} must use card-owned node groups`);
  assert.match(svg,/Source:/,`${file} must expose source metadata`);
  assert.doesNotMatch(svg,/gradient/i,`${file} must not use gradients`);
  assert.doesNotMatch(svg,/class="rail[^"]*"[^>]*marker-end/,`${file} branch rails must not carry arrowheads`);
  const cardPattern=/<g class="node-card"[^>]*data-card-width="([0-9.]+)"[^>]*data-card-height="([0-9.]+)"[^>]*>([\s\S]*?)<\/g>/g;
  for(const match of svg.matchAll(cardPattern)){
    const cardWidth=Number(match[1]),cardHeight=Number(match[2]),body=match[3];
    const badge=body.match(/<g class="node-badge"[\s\S]*?<rect x="([0-9.]+)" y="([0-9.]+)" width="([0-9.]+)" height="([0-9.]+)"/);
    if(!badge) continue;
    const [,x,y,w,h]=badge.map(Number);
    assert.ok(x>=0&&y>=0&&x+w<=cardWidth+0.01&&y+h<=cardHeight+0.01,`${file} badge must fit inside parent card`);
  }
}
console.log("chart and architecture visual grammar checks passed");
