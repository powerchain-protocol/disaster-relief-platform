import type { FastifyInstance } from "fastify";
import { DomainInvariantError, type CapitalTransition } from "../../domain/capital.js";
import { addApproval, addEvidence, createIntent, getIntent, prepareRelease, reviewRelease, transitionIntent, prepareSettlement, submitSettlement, setSettlementUnknown, reconcileSettlement } from "../../services/relief-capital.js";

function key(request: { headers: Record<string, unknown> }) {
  const value=request.headers["idempotency-key"];
  if (typeof value !== "string" || value.trim().length < 8) {
    const error=new Error("Idempotency-Key header of at least 8 characters is required") as Error & {statusCode?:number;code?:string};
    error.statusCode=400; error.code="IDEMPOTENCY_KEY_REQUIRED"; throw error;
  }
  return value.trim();
}

function bigint(value: unknown, field: string) {
  if (typeof value !== "string" || !/^[0-9]+$/.test(value)) {
    const error=new Error(`${field} must be an unsigned atomic-unit integer string`) as Error & {statusCode?:number;code?:string};
    error.statusCode=400; error.code="INVALID_ATOMIC_AMOUNT"; throw error;
  }
  return BigInt(value);
}

function policy(input: any) {
  return {
    minimumApprovals: Number(input.minimumApprovals ?? 1),
    requiredRoles: Array.isArray(input.requiredRoles) ? input.requiredRoles.map(String) : [],
    requireVerifiedEvidence: input.requireVerifiedEvidence !== false,
    minimumVerifiedEvidence: Number(input.minimumVerifiedEvidence ?? 1),
    requireSignerReady: input.requireSignerReady !== false,
    maximumReleaseAtomic: input.maximumReleaseAtomic == null ? undefined : bigint(input.maximumReleaseAtomic,"maximumReleaseAtomic"),
  };
}

function failure(reply:any,error:unknown){
  const e=error as Error & {statusCode?:number;code?:string;details?:unknown};
  const status=e.statusCode ?? (e instanceof DomainInvariantError ? 409 : 500);
  return reply.code(status).send({code:e.code ?? (e instanceof DomainInvariantError?e.code:"CAPITAL_DOMAIN_ERROR"),message:e.message,details:e.details});
}

export async function registerCapitalV1Routes(app: FastifyInstance) {
  app.post("/api/v1/capital/intents",{config:{rateLimit:{max:30,timeWindow:"1 minute"}}},async(request:any,reply)=>{
    try{
      const currency=request.body?.currency;
      if(currency!=="USDC"&&currency!=="SOL") return reply.code(400).send({code:"INVALID_CURRENCY",message:"currency must be USDC or SOL"});
      return reply.code(201).send(createIntent({currency,idempotencyKey:key(request)}));
    }catch(error){return failure(reply,error)}
  });

  app.get("/api/v1/capital/intents/:id",async(request:any,reply)=>{
    try{return reply.send(getIntent(request.params.id))}catch(error){return failure(reply,error)}
  });

  app.post("/api/v1/capital/intents/:id/transitions",async(request:any,reply)=>{
    try{
      const body=request.body??{};
      const transition = body.amount == null
        ? {type:String(body.type)}
        : {type:String(body.type),amount:bigint(body.amount,"amount")};
      return reply.send(transitionIntent(request.params.id,transition as CapitalTransition,key(request)));
    }catch(error){return failure(reply,error)}
  });

  app.post("/api/v1/capital/intents/:id/evidence",async(request:any,reply)=>{
    try{
      const body=request.body??{};
      return reply.code(201).send(addEvidence(request.params.id,{
        type:body.type??"OTHER",
        contentHashSha256:String(body.contentHashSha256??""),
        verified:Boolean(body.verified),
        verifiedAt:body.verifiedAt?String(body.verifiedAt):null,
        verifierId:body.verifierId?String(body.verifierId):null,
      },key(request)));
    }catch(error){return failure(reply,error)}
  });

  app.post("/api/v1/capital/intents/:id/approvals",async(request:any,reply)=>{
    try{
      const body=request.body??{};
      if(!body.role||!body.approverId) return reply.code(400).send({code:"APPROVAL_FIELDS_REQUIRED",message:"role and approverId are required"});
      return reply.code(201).send(addApproval(request.params.id,{
        role:String(body.role),approverId:String(body.approverId),approved:body.approved!==false,approvedAt:String(body.approvedAt??new Date().toISOString()),
      },key(request)));
    }catch(error){return failure(reply,error)}
  });

  app.post("/api/v1/capital/intents/:id/release-review",async(request:any,reply)=>{
    try{
      const body=request.body??{};
      return reply.send(reviewRelease(request.params.id,{requestedAmount:bigint(body.requestedAmount,"requestedAmount"),signerReady:Boolean(body.signerReady),policy:policy(body.policy??{})}));
    }catch(error){return failure(reply,error)}
  });

  app.post("/api/v1/capital/intents/:id/release-prepare",async(request:any,reply)=>{
    try{
      const body=request.body??{};
      return reply.send(prepareRelease(request.params.id,{requestedAmount:bigint(body.requestedAmount,"requestedAmount"),signerReady:Boolean(body.signerReady),policy:policy(body.policy??{}),idempotencyKey:key(request)}));
    }catch(error){return failure(reply,error)}
  });
  app.post("/api/v1/capital/intents/:id/settlements/prepare",async(request:any,reply)=>{
    try{const b=request.body??{};return reply.send(prepareSettlement(request.params.id,{amountAtomic:bigint(b.amountAtomic,"amountAtomic"),destination:String(b.destination??""),idempotencyKey:key(request)}))}catch(error){return failure(reply,error)}
  });

  app.post("/api/v1/capital/intents/:id/settlements/:executionId/submit",async(request:any,reply)=>{
    try{const b=request.body??{};return reply.send(submitSettlement(request.params.id,request.params.executionId,String(b.signature??""),key(request)))}catch(error){return failure(reply,error)}
  });

  app.post("/api/v1/capital/intents/:id/settlements/:executionId/unknown",async(request:any,reply)=>{
    try{return reply.send(setSettlementUnknown(request.params.id,request.params.executionId,key(request)))}catch(error){return failure(reply,error)}
  });

  app.post("/api/v1/capital/intents/:id/settlements/:executionId/reconcile",async(request:any,reply)=>{
    try{const b=request.body??{};return reply.send(reconcileSettlement(request.params.id,request.params.executionId,{signature:String(b.signature??""),finalized:Boolean(b.finalized),amountAtomic:bigint(b.amountAtomic,"amountAtomic"),destination:String(b.destination??""),idempotencyKey:key(request)}))}catch(error){return failure(reply,error)}
  });

}
