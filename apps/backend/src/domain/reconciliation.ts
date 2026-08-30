import { DomainInvariantError } from "./capital.js";

export type ExecutionState =
  | "PREPARED"
  | "SUBMITTED"
  | "CONFIRMING"
  | "CONFIRMED"
  | "EXECUTION_UNKNOWN"
  | "FAILED"
  | "RECONCILED";

export type SettlementExecution = {
  id: string;
  intentId: string;
  state: ExecutionState;
  signature: string | null;
  expectedAmountAtomic: bigint;
  observedAmountAtomic: bigint | null;
  expectedDestination: string;
  observedDestination: string | null;
  submittedAt: string | null;
  confirmedAt: string | null;
  reconciledAt: string | null;
};

export type ReconciliationObservation = {
  signature: string;
  finalized: boolean;
  amountAtomic: bigint;
  destination: string;
};

export function createExecution(input: {
  id: string; intentId: string; amountAtomic: bigint; destination: string;
}): SettlementExecution {
  if (input.amountAtomic <= 0n) throw new DomainInvariantError("INVALID_EXECUTION_AMOUNT","Execution amount must be positive");
  if (!input.destination.trim()) throw new DomainInvariantError("DESTINATION_REQUIRED","Settlement destination is required");
  return {
    id:input.id,intentId:input.intentId,state:"PREPARED",signature:null,
    expectedAmountAtomic:input.amountAtomic,observedAmountAtomic:null,
    expectedDestination:input.destination,observedDestination:null,
    submittedAt:null,confirmedAt:null,reconciledAt:null,
  };
}

export function markSubmitted(execution:SettlementExecution,signature:string,now=new Date().toISOString()) {
  if (execution.state !== "PREPARED") throw new DomainInvariantError("EXECUTION_NOT_PREPARED","Only prepared executions can be submitted");
  if (!signature.trim()) throw new DomainInvariantError("SIGNATURE_REQUIRED","Transaction signature is required");
  return {...execution,state:"SUBMITTED" as const,signature,submittedAt:now};
}

export function markExecutionUnknown(execution:SettlementExecution) {
  if (!["SUBMITTED","CONFIRMING"].includes(execution.state)) throw new DomainInvariantError("UNKNOWN_STATE_NOT_ALLOWED","Execution can be unknown only after submission");
  return {...execution,state:"EXECUTION_UNKNOWN" as const};
}

export function reconcileExecution(execution:SettlementExecution,observation:ReconciliationObservation,now=new Date().toISOString()) {
  if (!execution.signature) throw new DomainInvariantError("EXECUTION_NOT_SUBMITTED","Execution has no submitted signature");
  if (execution.signature !== observation.signature) throw new DomainInvariantError("SIGNATURE_MISMATCH","Observed transaction does not match submitted signature");
  if (!observation.finalized) return {...execution,state:"CONFIRMING" as const,observedAmountAtomic:observation.amountAtomic,observedDestination:observation.destination};
  if (observation.amountAtomic !== execution.expectedAmountAtomic) throw new DomainInvariantError("SETTLEMENT_AMOUNT_MISMATCH","Observed amount does not match prepared amount");
  if (observation.destination !== execution.expectedDestination) throw new DomainInvariantError("SETTLEMENT_DESTINATION_MISMATCH","Observed destination does not match prepared destination");
  return {...execution,state:"RECONCILED" as const,observedAmountAtomic:observation.amountAtomic,observedDestination:observation.destination,confirmedAt:now,reconciledAt:now};
}

export function serializeExecution(execution:SettlementExecution) {
  return {...execution,expectedAmountAtomic:execution.expectedAmountAtomic.toString(),observedAmountAtomic:execution.observedAmountAtomic?.toString()??null};
}
