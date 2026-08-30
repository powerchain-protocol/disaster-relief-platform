export type RewardReason = "VERIFIED_FIELD_EVIDENCE" | "VERIFIED_SUPPLIER_DELIVERY" | "VERIFIED_IMPACT" | "COMMUNITY_PARTICIPATION" | "VERIFIED_DATA_CONTRIBUTION";

export interface RewardEpoch {
  id: string;
  budgetAtomic: bigint;
  distributedAtomic: bigint;
  maxPerSubjectAtomic: bigint;
  maxPerOrganizationAtomic: bigint;
  startsAt: Date;
  endsAt: Date;
  policyVersion: string;
}

export interface RewardRecommendation {
  subjectId: string;
  organizationId?: string;
  reason: RewardReason;
  amountAtomic: bigint;
  evidenceIds: readonly string[];
  duplicate: boolean;
  verified: boolean;
  challenged?: boolean;
}

export interface RewardUsageSnapshot {
  subjectDistributedAtomic: bigint;
  organizationDistributedAtomic: bigint;
  previouslyRewardedEvidenceIds: ReadonlySet<string>;
}

export function validateReward(epoch: RewardEpoch, recommendation: RewardRecommendation, usage: RewardUsageSnapshot, now = new Date()) {
  const errors: string[] = [];
  if (!epoch.id.trim() || !epoch.policyVersion.trim()) errors.push("EPOCH_POLICY_BINDING_REQUIRED");
  if (now < epoch.startsAt || now > epoch.endsAt) errors.push("EPOCH_INACTIVE");
  if (!recommendation.subjectId.trim()) errors.push("SUBJECT_REQUIRED");
  if (!recommendation.verified) errors.push("VERIFICATION_REQUIRED");
  if (recommendation.duplicate) errors.push("DUPLICATE_REWARD");
  if (recommendation.challenged) errors.push("REWARD_UNDER_CHALLENGE");
  if (recommendation.evidenceIds.length === 0) errors.push("EVIDENCE_REQUIRED");
  if (new Set(recommendation.evidenceIds).size !== recommendation.evidenceIds.length) errors.push("DUPLICATE_EVIDENCE_ID");
  if (recommendation.evidenceIds.some(id => usage.previouslyRewardedEvidenceIds.has(id))) errors.push("EVIDENCE_ALREADY_REWARDED");
  if (recommendation.amountAtomic <= 0n) errors.push("INVALID_REWARD_AMOUNT");
  if (usage.subjectDistributedAtomic + recommendation.amountAtomic > epoch.maxPerSubjectAtomic) errors.push("SUBJECT_LIMIT_EXCEEDED");
  if (recommendation.organizationId && usage.organizationDistributedAtomic + recommendation.amountAtomic > epoch.maxPerOrganizationAtomic) errors.push("ORGANIZATION_LIMIT_EXCEEDED");
  if (epoch.distributedAtomic + recommendation.amountAtomic > epoch.budgetAtomic) errors.push("EPOCH_BUDGET_EXCEEDED");
  return { eligibleForReview: errors.length === 0, errors, automaticMint: false as const, authority: "REWARD_POLICY_REVIEW" as const };
}
