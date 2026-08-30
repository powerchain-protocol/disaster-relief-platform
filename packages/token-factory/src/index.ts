export type IssuerProfile = "PROJECT" | "COMPANY" | "GOVERNMENT";
export type SupplyControl = "FIXED_SUPPLY" | "CAPPED_MINT" | "RESERVE_BACKED";

export interface TokenFactoryPolicy {
  issuerProfile: IssuerProfile;
  name: string;
  ticker: string;
  decimals: number;
  maxSupplyAtomic: bigint;
  supplyControl: SupplyControl;
  restrictedTransfers: boolean;
  confidentialTransfers: boolean;
  mintAuthorityMode: "REVOKED_AFTER_GENESIS" | "MULTISIG" | "HSM_MPC";
  reserveAsset?: string;
  reserveRatioBps?: number;
  metadataUri: string;
}

export function normalizeTicker(input: string) {
  const ticker = input.trim().toUpperCase();
  if (!/^[A-Z0-9]{2,10}$/.test(ticker)) throw new Error("INVALID_TICKER");
  return ticker;
}

export function saferDefaults(profile: IssuerProfile) {
  if (profile === "GOVERNMENT") return { restrictedTransfers: true, mintAuthorityMode: "HSM_MPC" as const };
  if (profile === "COMPANY") return { restrictedTransfers: false, mintAuthorityMode: "MULTISIG" as const };
  return { restrictedTransfers: false, mintAuthorityMode: "MULTISIG" as const };
}

export function validateTokenFactoryPolicy(policy: TokenFactoryPolicy) {
  const errors: string[] = [];
  try { normalizeTicker(policy.ticker); } catch { errors.push("INVALID_TICKER"); }
  if (!policy.name.trim()) errors.push("NAME_REQUIRED");
  if (policy.decimals < 0 || policy.decimals > 9) errors.push("INVALID_DECIMALS");
  if (policy.maxSupplyAtomic <= 0n) errors.push("INVALID_SUPPLY_CAP");
  if (!policy.metadataUri.trim()) errors.push("METADATA_REQUIRED");
  if (policy.issuerProfile === "GOVERNMENT" && !policy.restrictedTransfers) errors.push("GOVERNMENT_RESTRICTED_TRANSFER_REVIEW_REQUIRED");
  if (policy.supplyControl === "RESERVE_BACKED") {
    if (!policy.reserveAsset) errors.push("RESERVE_ASSET_REQUIRED");
    if (!policy.reserveRatioBps || policy.reserveRatioBps < 10_000) errors.push("RESERVE_RATIO_TOO_LOW");
    if (policy.mintAuthorityMode === "REVOKED_AFTER_GENESIS") errors.push("RESERVE_BACKED_REQUIRES_CONTROLLED_MINT_AUTHORITY");
  }
  if (policy.confidentialTransfers) errors.push("CONFIDENTIAL_TRANSFER_PRODUCTION_REVIEW_REQUIRED");
  return { readyForProductionReview: errors.length === 0, errors } as const;
}
