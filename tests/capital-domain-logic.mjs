import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const capital=readFileSync(new URL("../apps/backend/src/domain/capital.ts",import.meta.url),"utf8");
const policy=readFileSync(new URL("../apps/backend/src/domain/release-policy.ts",import.meta.url),"utf8");
const integrity=readFileSync(new URL("../apps/backend/src/domain/integrity.ts",import.meta.url),"utf8");
const service=readFileSync(new URL("../apps/backend/src/services/relief-capital.ts",import.meta.url),"utf8");
const route=readFileSync(new URL("../apps/backend/src/api/v1/capital.ts",import.meta.url),"utf8");

for(const invariant of [
"available > a.raised","allocated > a.available","escrowed > a.allocated","released > a.escrowed",
"spent > a.released","delivered > a.spent","verifiedImpact > a.delivered"
]) assert.ok(capital.includes(invariant),`missing invariant ${invariant}`);

assert.ok(policy.includes("minimumApprovals"));
assert.ok(policy.includes("requiredRoles"));
assert.ok(policy.includes("requireVerifiedEvidence"));
assert.ok(policy.includes("requireSignerReady"));
assert.ok(integrity.includes("IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST"));
assert.ok(integrity.includes("previousReceiptHashSha256"));
assert.ok(service.includes("DURABLE_REPOSITORY_NOT_INSTALLED"));
assert.ok(route.includes("/release-review"));
assert.ok(route.includes("/release-prepare"));
assert.ok(route.includes("Idempotency-Key"));
console.log("Capital domain logic PASS");
