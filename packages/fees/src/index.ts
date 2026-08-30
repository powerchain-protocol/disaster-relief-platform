export interface ContributorFeeQuote {
  version: string;
  asset: string;
  principalAtomic: bigint;
  serviceFeeAtomic: bigint;
  tokenTransferFeeAtomic: bigint;
  networkFeeEstimateAtomic: bigint;
  providerFeeAtomic: bigint;
  contributorTotalAtomic: bigint;
  successCommissionChargedNowAtomic: 0n;
}

export interface SuccessCommissionQuote {
  version: string;
  source: "SUCCESSFUL_POOL_PROCEEDS";
  principalAtomic: bigint;
  totalBps: 500;
  totalAtomic: bigint;
  communityBps: 200;
  communityAtomic: bigint;
  ecosystemDevelopmentBps: 300;
  ecosystemDevelopmentAtomic: bigint;
  contributorChargeAtomic: 0n;
}

const BPS_DENOMINATOR = 10_000n;

function nonNegative(value: bigint, label: string) {
  if (value < 0n) throw new Error(`${label}_NEGATIVE`);
}

export function feeFromBpsFloor(principalAtomic: bigint, bps: number) {
  if (principalAtomic <= 0n) throw new Error("INVALID_FEE_PRINCIPAL");
  if (!Number.isInteger(bps) || bps < 0 || bps > 10_000) throw new Error("INVALID_BPS");
  return principalAtomic * BigInt(bps) / BPS_DENOMINATOR;
}

export function buildContributorFeeQuote(input: {
  version: string;
  asset: string;
  principalAtomic: bigint;
  serviceFeeBps?: number;
  tokenTransferFeeAtomic?: bigint;
  networkFeeEstimateAtomic?: bigint;
  providerFeeAtomic?: bigint;
}): ContributorFeeQuote {
  if (!input.version.trim()) throw new Error("FEE_SCHEDULE_VERSION_REQUIRED");
  if (!input.asset.trim()) throw new Error("ASSET_REQUIRED");
  if (input.principalAtomic <= 0n) throw new Error("INVALID_PRINCIPAL");
  const serviceFeeAtomic = feeFromBpsFloor(input.principalAtomic, input.serviceFeeBps ?? 0);
  const tokenTransferFeeAtomic = input.tokenTransferFeeAtomic ?? 0n;
  const networkFeeEstimateAtomic = input.networkFeeEstimateAtomic ?? 0n;
  const providerFeeAtomic = input.providerFeeAtomic ?? 0n;
  for (const [label, value] of Object.entries({ tokenTransferFeeAtomic, networkFeeEstimateAtomic, providerFeeAtomic })) nonNegative(value, label.toUpperCase());
  return {
    version: input.version,
    asset: input.asset,
    principalAtomic: input.principalAtomic,
    serviceFeeAtomic,
    tokenTransferFeeAtomic,
    networkFeeEstimateAtomic,
    providerFeeAtomic,
    contributorTotalAtomic: input.principalAtomic + serviceFeeAtomic + tokenTransferFeeAtomic + networkFeeEstimateAtomic + providerFeeAtomic,
    successCommissionChargedNowAtomic: 0n,
  };
}

export function buildSuccessCommission(principalAtomic: bigint, version = "1.0.0"): SuccessCommissionQuote {
  if (!version.trim()) throw new Error("FEE_SCHEDULE_VERSION_REQUIRED");
  const communityAtomic = feeFromBpsFloor(principalAtomic, 200);
  const ecosystemDevelopmentAtomic = feeFromBpsFloor(principalAtomic, 300);
  return {
    version,
    source: "SUCCESSFUL_POOL_PROCEEDS",
    principalAtomic,
    totalBps: 500,
    totalAtomic: communityAtomic + ecosystemDevelopmentAtomic,
    communityBps: 200,
    communityAtomic,
    ecosystemDevelopmentBps: 300,
    ecosystemDevelopmentAtomic,
    contributorChargeAtomic: 0n,
  };
}
