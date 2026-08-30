export type DeploymentState = "LIVE" | "DEGRADED" | "DISABLED" | "TBA" | "UNAVAILABLE";
export type FinancialAction = "FUND" | "ALLOCATE" | "ESCROW" | "RELEASE" | "COMMISSION" | "BRIDGE" | "MINT" | "REWARD";

export interface ActionBinding {
  quoteId: string;
  quoteHash: string;
  feeQuoteHash: string;
  policyVersion: string;
  feeScheduleVersion: string;
  deploymentId: string;
  actorId: string;
  organizationId: string;
  resourceId: string;
  network: string;
  programId?: string;
  asset: string;
  amountAtomic: string;
  purpose: string;
  destination: string;
  expiresAt: string;
  idempotencyKey: string;
}

const boundedId = /^[-a-zA-Z0-9_.:]{3,192}$/;

export function validateActionBinding(binding: ActionBinding, now = new Date()) {
  const errors: string[] = [];
  if (!/^[-a-zA-Z0-9_.:]{6,128}$/.test(binding.quoteId)) errors.push("INVALID_QUOTE_ID");
  if (!/^[a-f0-9]{64}$/i.test(binding.quoteHash)) errors.push("INVALID_QUOTE_HASH");
  if (!/^[a-f0-9]{64}$/i.test(binding.feeQuoteHash)) errors.push("INVALID_FEE_QUOTE_HASH");
  for (const [field, value] of Object.entries({ policyVersion: binding.policyVersion, feeScheduleVersion: binding.feeScheduleVersion, deploymentId: binding.deploymentId, actorId: binding.actorId, organizationId: binding.organizationId, resourceId: binding.resourceId, network: binding.network, asset: binding.asset, purpose: binding.purpose, destination: binding.destination, idempotencyKey: binding.idempotencyKey })) {
    if (!value.trim() || !boundedId.test(value)) errors.push(`${field.replace(/[A-Z]/g, m => `_${m}`).toUpperCase()}_INVALID`);
  }
  if (!/^[1-9]\d*$/.test(binding.amountAtomic)) errors.push("INVALID_AMOUNT_ATOMIC");
  const expiry = new Date(binding.expiresAt);
  if (!Number.isFinite(expiry.getTime()) || expiry <= now) errors.push("QUOTE_EXPIRED");
  if (Number.isFinite(expiry.getTime()) && expiry.getTime() - now.getTime() > 15 * 60_000) errors.push("QUOTE_TTL_TOO_LONG");
  return { valid: errors.length === 0, errors } as const;
}

export function assertNoUtilityTreasuryAuthority(input: { pwrcBalanceAtomic: string; requestedAction: FinancialAction }) {
  if (!/^\d+$/.test(input.pwrcBalanceAtomic)) throw new Error("INVALID_PWRC_BALANCE");
  return { allowedByPwrcBalance: false as const, reason: "PWRC_BALANCE_IS_UTILITY_NOT_FINANCIAL_AUTHORITY", requestedAction: input.requestedAction };
}
