import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const economics = JSON.parse(readFileSync(new URL("../config/economics.json", import.meta.url), "utf8"));
const routes = JSON.parse(readFileSync(new URL("../config/route-status.json", import.meta.url), "utf8"));
const architecture = JSON.parse(readFileSync(new URL("../config/architecture-data.json", import.meta.url), "utf8"));

assert.equal(economics.version, "1.0.0");
assert.equal(economics.pwrc.role, "NETWORK_UTILITY");
assert.equal(economics.pwrc.crisisFundingRequired, false);
assert.equal(economics.pwrc.treasuryAuthorityFromBalance, false);

const c = economics.successfulFundingCommission;
assert.equal(c.totalBps, 500);
assert.equal(c.communityTreasuryBps + c.ecosystemDevelopmentBps, c.totalBps);
assert.equal(c.settlement, "ATOMIC_SPLIT_THEN_RECONCILE");
assert.equal(c.chargedFrom, "SUCCESSFUL_POOL_PROCEEDS");
assert.equal(c.contributorCheckoutChargeBps, 0);
assert.equal(c.rounding, "FLOOR_ATOMIC_UNITS");

const principal = 1_000_000n;
const community = principal * BigInt(c.communityTreasuryBps) / 10_000n;
const ecosystem = principal * BigInt(c.ecosystemDevelopmentBps) / 10_000n;
assert.equal(community, 20_000n);
assert.equal(ecosystem, 30_000n);
assert.equal(community + ecosystem, 50_000n);

assert.equal(economics.tokenFactory.automaticMint, false);
assert.ok(routes.routes.every(route => route.status !== "LIVE"), "overlay must not fabricate live cross-chain deployment state");
assert.equal(routes.routes.find(route => route.id === "wpwrc-sui")?.status, "TBA");

console.log("PowerChain v1.0.0 economic and route invariants passed");

assert.equal(architecture.visualGrammar.connectorStyle, "ORTHOGONAL");
assert.equal(architecture.visualGrammar.noGradients, true);
assert.equal(architecture.demoFixtures.nepalFloodResponse.label, "DEMO ONLY");
assert.equal(architecture.productionDataRule, "MAINNET_UI_MUST_USE_AUTHORITATIVE_SOURCE_OR_EXPLICIT_UNAVAILABLE_STATE");
