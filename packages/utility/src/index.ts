export type UtilityCategory = "ACCESS" | "COMPUTE" | "SERVICES" | "PARTICIPATION" | "GOVERNANCE" | "INCENTIVES" | "REPUTATION" | "NETWORK";
export type UtilityTier = "EXPLORER" | "CONTRIBUTOR" | "OPERATOR" | "PROFESSIONAL" | "ENTERPRISE";

export const DEFAULT_PWRC_PER_POWER_UNIT = 10n;

export interface UtilityServicePrice {
  service: string;
  category: UtilityCategory;
  powerUnits: bigint;
  pwrcAtomic: bigint;
}

export const REFERENCE_UTILITY_PRICES: readonly UtilityServicePrice[] = [
  { service: "ai.crisis-analysis", category: "COMPUTE", powerUnits: 500n, pwrcAtomic: 5_000n * 1_000_000_000n },
  { service: "ai.risk-analysis", category: "COMPUTE", powerUnits: 250n, pwrcAtomic: 2_500n * 1_000_000_000n },
  { service: "ai.procurement-analysis", category: "COMPUTE", powerUnits: 750n, pwrcAtomic: 7_500n * 1_000_000_000n },
  { service: "impact.report", category: "SERVICES", powerUnits: 1_000n, pwrcAtomic: 10_000n * 1_000_000_000n },
];

export function pwrcWholeToPowerUnits(pwrcWhole: bigint, pwrcPerUnit = DEFAULT_PWRC_PER_POWER_UNIT) {
  if (pwrcWhole < 0n || pwrcPerUnit <= 0n) throw new Error("INVALID_UTILITY_RATE");
  return pwrcWhole / pwrcPerUnit;
}

export function utilityTier(powerUnits: bigint): UtilityTier {
  if (powerUnits >= 5_000_000n) return "ENTERPRISE";
  if (powerUnits >= 500_000n) return "PROFESSIONAL";
  if (powerUnits >= 50_000n) return "OPERATOR";
  if (powerUnits >= 1_000n) return "CONTRIBUTOR";
  return "EXPLORER";
}
