import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const approvalPath = resolve(root, process.env.RELEASE_APPROVAL_FILE || "release/approvals/runbook-rollback.json");
const failures = [];
const sha256 = path => createHash("sha256").update(readFileSync(path)).digest("hex");
if (!existsSync(approvalPath)) failures.push(`approval file missing: ${approvalPath}`);
else {
  let approval;
  try { approval = JSON.parse(readFileSync(approvalPath, "utf8")); } catch { failures.push("approval file is not valid JSON"); }
  if (approval) {
    if (approval.schemaVersion !== "1.0.0") failures.push("approval schemaVersion must be 1.0.0");
    if (approval.releaseVersion !== "1.0.0") failures.push("approval releaseVersion must be 1.0.0");
    if (approval.status !== "APPROVED") failures.push("runbook/rollback approval status must be APPROVED");
    if (!Array.isArray(approval.approvers) || approval.approvers.length < 1 || approval.approvers.some(x => !x?.name || !x?.approvedAt)) failures.push("at least one named approver with approvedAt is required");
    const runbook = resolve(root, "docs/OPERATIONS_RUNBOOK.md");
    const rollback = resolve(root, "docs/ROLLBACK.md");
    if (!existsSync(rollback)) failures.push("docs/ROLLBACK.md is missing");
    if (approval.runbookSha256 !== sha256(runbook)) failures.push("approval runbookSha256 does not match current docs/OPERATIONS_RUNBOOK.md");
    if (existsSync(rollback) && approval.rollbackSha256 !== sha256(rollback)) failures.push("approval rollbackSha256 does not match current docs/ROLLBACK.md");
  }
}
if (failures.length) { console.error("Runbook/rollback approval gate failed:\n- " + failures.join("\n- ")); process.exit(1); }
console.log("Runbook and rollback approval gate passed");
