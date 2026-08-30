import { randomUUID } from "node:crypto";
import { applyCapitalTransition, createCapitalIntent, DomainInvariantError, serializeCapitalIntent, type CapitalIntent, type CapitalTransition } from "../domain/capital.js";
import { createReceipt, IdempotencyRegistry, type ImmutableReceipt } from "../domain/integrity.js";
import { evaluateRelease, type ApprovalRecord, type EvidenceRecord, type ReleasePolicy } from "../domain/release-policy.js";
import { createExecution, markSubmitted, markExecutionUnknown, reconcileExecution, serializeExecution, type SettlementExecution } from "../domain/reconciliation.js";
import { settlementJournal, serializeJournal, type JournalEntry } from "../domain/ledger.js";

type CapitalAggregate = {
  intent: CapitalIntent;
  evidence: EvidenceRecord[];
  approvals: ApprovalRecord[];
  receipts: ImmutableReceipt[];
  executions: SettlementExecution[];
  journals: JournalEntry[];
};

const store = new Map<string,CapitalAggregate>();
const idempotency = new IdempotencyRegistry();

function mutationsAllowed() {
  const production = process.env.NODE_ENV === "production" || process.env.POWERCHAIN_ENV === "production";
  if (production) return process.env.RELIEF_MUTATION_STORE === "durable";
  return process.env.RELIEF_MUTATION_STORE !== "disabled";
}

function assertMutationStore() {
  if (!mutationsAllowed()) {
    const error = new Error("State-changing relief APIs are disabled because no durable production mutation store is configured") as Error & { statusCode?: number; code?: string };
    error.statusCode = 503;
    error.code = "DURABLE_MUTATION_STORE_REQUIRED";
    throw error;
  }
  if ((process.env.NODE_ENV === "production" || process.env.POWERCHAIN_ENV === "production") && process.env.RELIEF_MUTATION_STORE === "durable") {
    const error = new Error("Durable repository adapter is required before production mutation APIs can be enabled") as Error & { statusCode?: number; code?: string };
    error.statusCode = 503;
    error.code = "DURABLE_REPOSITORY_NOT_INSTALLED";
    throw error;
  }
}

function aggregate(id: string) {
  const found = store.get(id);
  if (!found) {
    const error = new Error("Capital intent not found") as Error & { statusCode?: number; code?: string };
    error.statusCode = 404;
    error.code = "CAPITAL_INTENT_NOT_FOUND";
    throw error;
  }
  return found;
}

function appendReceipt(item: CapitalAggregate, kind: string, payload: unknown) {
  const previous = item.receipts.at(-1)?.receiptHashSha256 ?? null;
  const receipt = createReceipt(kind,item.intent.id,payload,previous);
  item.receipts.push(receipt);
  return receipt;
}

export function createIntent(input: { currency: "USDC" | "SOL"; idempotencyKey: string }) {
  assertMutationStore();
  return idempotency.execute(input.idempotencyKey,input,() => {
    const intent=createCapitalIntent(randomUUID(),input.currency);
    const item:CapitalAggregate={intent,evidence:[],approvals:[],receipts:[],executions:[],journals:[]};
    appendReceipt(item,"CAPITAL_INTENT_CREATED",serializeCapitalIntent(intent));
    store.set(intent.id,item);
    return snapshot(item);
  });
}

export function getIntent(id: string) {
  return snapshot(aggregate(id));
}

export function transitionIntent(id: string, transition: CapitalTransition, idempotencyKey: string) {
  assertMutationStore();
  return idempotency.execute(idempotencyKey,{id,transition},() => {
    const item=aggregate(id);
    item.intent=applyCapitalTransition(item.intent,transition);
    appendReceipt(item,`CAPITAL_${transition.type}`,{transition,intent:serializeCapitalIntent(item.intent)});
    return snapshot(item);
  });
}

export function addEvidence(id: string, input: Omit<EvidenceRecord,"id">, idempotencyKey: string) {
  assertMutationStore();
  return idempotency.execute(idempotencyKey,{id,input},() => {
    if (!/^[a-f0-9]{64}$/i.test(input.contentHashSha256)) throw new DomainInvariantError("INVALID_EVIDENCE_HASH","Evidence content hash must be SHA-256 hex");
    if (input.verified && (!input.verifiedAt || !input.verifierId)) throw new DomainInvariantError("VERIFICATION_METADATA_REQUIRED","Verified evidence requires verifier identity and timestamp");
    const item=aggregate(id);
    const record={...input,id:randomUUID()};
    item.evidence.push(record);
    appendReceipt(item,"EVIDENCE_ADDED",record);
    return snapshot(item);
  });
}

export function addApproval(id: string, input: Omit<ApprovalRecord,"id">, idempotencyKey: string) {
  assertMutationStore();
  return idempotency.execute(idempotencyKey,{id,input},() => {
    const item=aggregate(id);
    const duplicate=item.approvals.find(a=>a.approverId===input.approverId&&a.role===input.role&&a.approved);
    if (duplicate && input.approved) throw new DomainInvariantError("DUPLICATE_APPROVAL","The same approver cannot satisfy the same role twice");
    const record={...input,id:randomUUID()};
    item.approvals.push(record);
    appendReceipt(item,"APPROVAL_RECORDED",record);
    return snapshot(item);
  });
}

export function reviewRelease(id: string, input: { requestedAmount: bigint; signerReady: boolean; policy: ReleasePolicy }) {
  const item=aggregate(id);
  return evaluateRelease({intent:item.intent,requestedAmount:input.requestedAmount,evidence:item.evidence,approvals:item.approvals,signerReady:input.signerReady,policy:input.policy});
}

export function prepareRelease(id: string, input: { requestedAmount: bigint; signerReady: boolean; policy: ReleasePolicy; idempotencyKey: string }) {
  assertMutationStore();
  return idempotency.execute(input.idempotencyKey,{id,...input,requestedAmount:input.requestedAmount.toString()},() => {
    const item=aggregate(id);
    const review=evaluateRelease({intent:item.intent,requestedAmount:input.requestedAmount,evidence:item.evidence,approvals:item.approvals,signerReady:input.signerReady,policy:input.policy});
    if (!review.eligible) {
      const error=new DomainInvariantError("RELEASE_POLICY_FAILED","Release review failed");
      (error as DomainInvariantError & { details?: unknown }).details=review;
      throw error;
    }
    item.intent=applyCapitalTransition(item.intent,{type:"MARK_RELEASE_READY"});
    const receipt=appendReceipt(item,"RELEASE_REVIEW_PASSED",{requestedAmount:input.requestedAmount.toString(),review});
    return {aggregate:snapshot(item),review,receipt};
  });
}

function snapshot(item: CapitalAggregate) {
  return {
    intent: serializeCapitalIntent(item.intent),
    evidence: [...item.evidence],
    approvals: [...item.approvals],
    receipts: [...item.receipts],
    executions: item.executions.map(serializeExecution),
    journals: item.journals.map(serializeJournal),
    persistence: "IN_MEMORY_DEVELOPMENT_ONLY" as const,
  };
}


export function prepareSettlement(id:string,input:{amountAtomic:bigint;destination:string;idempotencyKey:string}){
  assertMutationStore();
  return idempotency.execute(input.idempotencyKey,{id,amountAtomic:input.amountAtomic.toString(),destination:input.destination},()=>{
    const item=aggregate(id);
    if(item.intent.state!=="RELEASE_READY") throw new DomainInvariantError("NOT_RELEASE_READY","Settlement preparation requires RELEASE_READY state");
    const execution=createExecution({id:randomUUID(),intentId:id,amountAtomic:input.amountAtomic,destination:input.destination});
    if(item.intent.amounts.released+input.amountAtomic>item.intent.amounts.escrowed) throw new DomainInvariantError("SETTLEMENT_EXCEEDS_ESCROW","Prepared settlement exceeds unreleased escrow");
    item.executions.push(execution);
    appendReceipt(item,"SETTLEMENT_PREPARED",serializeExecution(execution));
    return {execution:serializeExecution(execution),aggregate:snapshot(item)};
  });
}

export function submitSettlement(id:string,executionId:string,signature:string,idempotencyKey:string){
  assertMutationStore();
  return idempotency.execute(idempotencyKey,{id,executionId,signature},()=>{
    const item=aggregate(id); const index=item.executions.findIndex(e=>e.id===executionId);
    if(index<0) throw new DomainInvariantError("EXECUTION_NOT_FOUND","Settlement execution not found");
    item.executions[index]=markSubmitted(item.executions[index],signature);
    appendReceipt(item,"SETTLEMENT_SUBMITTED",serializeExecution(item.executions[index]));
    return {execution:serializeExecution(item.executions[index]),aggregate:snapshot(item)};
  });
}

export function setSettlementUnknown(id:string,executionId:string,idempotencyKey:string){
  assertMutationStore();
  return idempotency.execute(idempotencyKey,{id,executionId},()=>{
    const item=aggregate(id); const index=item.executions.findIndex(e=>e.id===executionId);
    if(index<0) throw new DomainInvariantError("EXECUTION_NOT_FOUND","Settlement execution not found");
    item.executions[index]=markExecutionUnknown(item.executions[index]);
    appendReceipt(item,"EXECUTION_UNKNOWN",serializeExecution(item.executions[index]));
    return {execution:serializeExecution(item.executions[index]),aggregate:snapshot(item)};
  });
}

export function reconcileSettlement(id:string,executionId:string,input:{signature:string;finalized:boolean;amountAtomic:bigint;destination:string;idempotencyKey:string}){
  assertMutationStore();
  return idempotency.execute(input.idempotencyKey,{id,executionId,...input,amountAtomic:input.amountAtomic.toString()},()=>{
    const item=aggregate(id); const index=item.executions.findIndex(e=>e.id===executionId);
    if(index<0) throw new DomainInvariantError("EXECUTION_NOT_FOUND","Settlement execution not found");
    const reconciled=reconcileExecution(item.executions[index],{signature:input.signature,finalized:input.finalized,amountAtomic:input.amountAtomic,destination:input.destination});
    item.executions[index]=reconciled;
    if(reconciled.state==="RECONCILED"){
      item.intent=applyCapitalTransition(item.intent,{type:"RELEASE",amount:reconciled.expectedAmountAtomic});
      const journal=settlementJournal({id:randomUUID(),reference:reconciled.signature!,currency:item.intent.currency,amountAtomic:reconciled.expectedAmountAtomic,treasuryAccount:"CRISIS_ESCROW",destinationAccount:`BENEFICIARY:${reconciled.expectedDestination}`});
      item.journals.push(journal);
      appendReceipt(item,"SETTLEMENT_RECONCILED",{execution:serializeExecution(reconciled),journal:serializeJournal(journal)});
    }
    return {execution:serializeExecution(reconciled),aggregate:snapshot(item)};
  });
}
