import type { CapitalIntent } from "./capital.js";

export type EvidenceRecord = {
  id: string;
  type: "MILESTONE" | "DELIVERY" | "INVOICE" | "METER" | "PHOTO" | "DOCUMENT" | "OTHER";
  contentHashSha256: string;
  verified: boolean;
  verifiedAt: string | null;
  verifierId: string | null;
};

export type ApprovalRecord = {
  id: string;
  role: string;
  approverId: string;
  approved: boolean;
  approvedAt: string;
};

export type ReleasePolicy = {
  minimumApprovals: number;
  requiredRoles: string[];
  requireVerifiedEvidence: boolean;
  minimumVerifiedEvidence: number;
  requireSignerReady: boolean;
  maximumReleaseAtomic?: bigint;
};

export type ReleaseReviewInput = {
  intent: CapitalIntent;
  requestedAmount: bigint;
  evidence: EvidenceRecord[];
  approvals: ApprovalRecord[];
  signerReady: boolean;
  policy: ReleasePolicy;
};

export type ReleaseReview = {
  eligible: boolean;
  checks: Array<{ code: string; ok: boolean; detail: string }>;
};

export function evaluateRelease(input: ReleaseReviewInput): ReleaseReview {
  const { intent, requestedAmount, evidence, approvals, signerReady, policy } = input;
  const approved = approvals.filter(a => a.approved);
  const verifiedEvidence = evidence.filter(e => e.verified);
  const approvedRoles = new Set(approved.map(a => a.role));
  const unreleasedEscrow = intent.amounts.escrowed - intent.amounts.released;

  const checks = [
    { code: "POSITIVE_RELEASE_AMOUNT", ok: requestedAmount > 0n, detail: "Requested release amount must be greater than zero" },
    { code: "ESCROW_AVAILABLE", ok: unreleasedEscrow >= requestedAmount, detail: "Requested release must not exceed unreleased escrow" },
    { code: "MINIMUM_APPROVALS", ok: approved.length >= policy.minimumApprovals, detail: `${approved.length}/${policy.minimumApprovals} approvals present` },
    { code: "REQUIRED_ROLES", ok: policy.requiredRoles.every(role => approvedRoles.has(role)), detail: `Required roles: ${policy.requiredRoles.join(", ") || "none"}` },
    { code: "VERIFIED_EVIDENCE", ok: !policy.requireVerifiedEvidence || verifiedEvidence.length >= policy.minimumVerifiedEvidence, detail: `${verifiedEvidence.length}/${policy.minimumVerifiedEvidence} verified evidence records present` },
    { code: "SIGNER_READY", ok: !policy.requireSignerReady || signerReady, detail: signerReady ? "Signer readiness confirmed" : "Signer is not ready" },
    { code: "RELEASE_CAP", ok: policy.maximumReleaseAtomic == null || requestedAmount <= policy.maximumReleaseAtomic, detail: policy.maximumReleaseAtomic == null ? "No release cap configured" : `Maximum release: ${policy.maximumReleaseAtomic}` },
  ];

  return { eligible: checks.every(check => check.ok), checks };
}
