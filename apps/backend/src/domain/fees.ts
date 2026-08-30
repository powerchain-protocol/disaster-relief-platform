import { DomainInvariantError } from "./capital.js";

export const SUCCESS_COMMISSION_BPS=500n;
export const COMMUNITY_SHARE_BPS=200n;
export const ECOSYSTEM_SHARE_BPS=300n;
export const BPS_DENOMINATOR=10_000n;

export function floorBps(amountAtomic:bigint,bps:bigint){
  if(amountAtomic<0n||bps<0n||bps>BPS_DENOMINATOR) throw new DomainInvariantError("INVALID_BPS_INPUT","Invalid amount or basis points");
  return amountAtomic*bps/BPS_DENOMINATOR;
}

export function successfulFundingCommission(amountAtomic:bigint,enabled:boolean){
  if(!enabled) return {commissionAtomic:0n,communityAtomic:0n,ecosystemAtomic:0n};
  const commissionAtomic=floorBps(amountAtomic,SUCCESS_COMMISSION_BPS);
  const communityAtomic=floorBps(amountAtomic,COMMUNITY_SHARE_BPS);
  const ecosystemAtomic=commissionAtomic-communityAtomic;
  if(ecosystemAtomic<0n) throw new DomainInvariantError("COMMISSION_SPLIT_INVALID","Commission split cannot be negative");
  return {commissionAtomic,communityAtomic,ecosystemAtomic};
}
