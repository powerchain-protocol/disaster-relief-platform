export type BridgeProvider = "CCTP_V2" | "CCIP" | "POWERCHAIN_WPWRC";
export type BridgeState = "LIVE" | "DEGRADED" | "DISABLED" | "TBA" | "UNAVAILABLE";

export interface BridgeRoute {
  id: string;
  version: string;
  provider: BridgeProvider;
  asset: string;
  sourceChain: string;
  destinationChain: string;
  status: BridgeState;
  audited: boolean;
  maxPerTransferAtomic: bigint;
  maxOutstandingAtomic?: bigint;
  sourceFinality: string;
  replayDomain: string;
}

export interface BridgeTransfer {
  routeId: string;
  routeVersion: string;
  replayDomain: string;
  transferId: string;
  asset: string;
  amountAtomic: bigint;
  sourceChain: string;
  destinationChain: string;
  sourceAddress: string;
  destinationAddress: string;
}

export function validateBridgeTransfer(route: BridgeRoute, transfer: BridgeTransfer, seenTransferIds: ReadonlySet<string> = new Set()) {
  const errors: string[] = [];
  if (route.status !== "LIVE") errors.push(`ROUTE_${route.status}`);
  if (!route.audited) errors.push("AUDIT_REQUIRED");
  if (transfer.routeId !== route.id) errors.push("ROUTE_ID_MISMATCH");
  if (transfer.routeVersion !== route.version) errors.push("ROUTE_VERSION_MISMATCH");
  if (transfer.replayDomain !== route.replayDomain) errors.push("REPLAY_DOMAIN_MISMATCH");
  if (!/^[A-Za-z0-9:._-]{12,192}$/.test(transfer.transferId)) errors.push("INVALID_TRANSFER_ID");
  if (seenTransferIds.has(transfer.transferId)) errors.push("TRANSFER_REPLAY");
  if (transfer.asset !== route.asset) errors.push("ASSET_MISMATCH");
  if (transfer.sourceChain !== route.sourceChain) errors.push("SOURCE_CHAIN_MISMATCH");
  if (transfer.destinationChain !== route.destinationChain) errors.push("DESTINATION_CHAIN_MISMATCH");
  if (transfer.sourceChain === transfer.destinationChain) errors.push("SAME_CHAIN_ROUTE_INVALID");
  if (transfer.amountAtomic <= 0n) errors.push("INVALID_AMOUNT");
  if (transfer.amountAtomic > route.maxPerTransferAtomic) errors.push("ROUTE_LIMIT_EXCEEDED");
  if (!transfer.sourceAddress.trim() || !transfer.destinationAddress.trim()) errors.push("ADDRESS_REQUIRED");
  return { executable: errors.length === 0, errors } as const;
}

export function verifyWrappedSupplyConservation(input: { verifiedBackingAtomic: bigint; outstandingWrappedAtomic: bigint; pendingMintAtomic?: bigint; maxOutstandingAtomic?: bigint }) {
  const pending = input.pendingMintAtomic ?? 0n;
  if (input.verifiedBackingAtomic < 0n || input.outstandingWrappedAtomic < 0n || pending < 0n) throw new Error("NEGATIVE_SUPPLY_STATE");
  const projectedOutstanding = input.outstandingWrappedAtomic + pending;
  const deficit = projectedOutstanding - input.verifiedBackingAtomic;
  const exceedsRouteCap = input.maxOutstandingAtomic !== undefined && projectedOutstanding > input.maxOutstandingAtomic;
  return {
    healthy: deficit <= 0n && !exceedsRouteCap,
    projectedOutstandingAtomic: projectedOutstanding,
    deficitAtomic: deficit > 0n ? deficit : 0n,
    surplusBackingAtomic: deficit < 0n ? -deficit : 0n,
    exceedsRouteCap,
    mintAllowed: deficit <= 0n && !exceedsRouteCap,
  } as const;
}
