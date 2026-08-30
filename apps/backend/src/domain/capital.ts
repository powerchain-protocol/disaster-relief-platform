export type CapitalState =
  | "CREATED"
  | "RAISED"
  | "AVAILABLE"
  | "ALLOCATED"
  | "ESCROWED"
  | "RELEASE_READY"
  | "RELEASED"
  | "SPENT"
  | "DELIVERED"
  | "VERIFIED_IMPACT"
  | "CANCELLED";

export type CapitalAmounts = {
  raised: bigint;
  available: bigint;
  allocated: bigint;
  escrowed: bigint;
  released: bigint;
  spent: bigint;
  delivered: bigint;
  verifiedImpact: bigint;
};

export type CapitalIntent = {
  id: string;
  currency: "USDC" | "SOL";
  state: CapitalState;
  amounts: CapitalAmounts;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type CapitalTransition =
  | { type: "RAISE"; amount: bigint }
  | { type: "MAKE_AVAILABLE"; amount: bigint }
  | { type: "ALLOCATE"; amount: bigint }
  | { type: "ESCROW"; amount: bigint }
  | { type: "MARK_RELEASE_READY" }
  | { type: "RELEASE"; amount: bigint }
  | { type: "MARK_SPENT"; amount: bigint }
  | { type: "MARK_DELIVERED"; amount: bigint }
  | { type: "VERIFY_IMPACT"; amount: bigint }
  | { type: "CANCEL" };

export class DomainInvariantError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "DomainInvariantError";
  }
}

const zero = (): CapitalAmounts => ({
  raised: 0n,
  available: 0n,
  allocated: 0n,
  escrowed: 0n,
  released: 0n,
  spent: 0n,
  delivered: 0n,
  verifiedImpact: 0n,
});

export function createCapitalIntent(id: string, currency: "USDC" | "SOL", now = new Date().toISOString()): CapitalIntent {
  if (!id.trim()) throw new DomainInvariantError("INVALID_INTENT_ID", "Capital intent ID is required");
  return { id, currency, state: "CREATED", amounts: zero(), createdAt: now, updatedAt: now, version: 1 };
}

function positive(amount: bigint, field = "amount") {
  if (amount <= 0n) throw new DomainInvariantError("INVALID_AMOUNT", `${field} must be greater than zero`);
}

function assertAccounting(a: CapitalAmounts) {
  const nonNegative = Object.entries(a).every(([,v]) => v >= 0n);
  if (!nonNegative) throw new DomainInvariantError("NEGATIVE_CAPITAL_STATE", "Capital amounts cannot be negative");
  if (a.available > a.raised) throw new DomainInvariantError("AVAILABLE_EXCEEDS_RAISED", "Available capital cannot exceed raised capital");
  if (a.allocated > a.available) throw new DomainInvariantError("ALLOCATED_EXCEEDS_AVAILABLE", "Allocated capital cannot exceed available capital");
  if (a.escrowed > a.allocated) throw new DomainInvariantError("ESCROW_EXCEEDS_ALLOCATED", "Escrowed capital cannot exceed allocated capital");
  if (a.released > a.escrowed) throw new DomainInvariantError("RELEASED_EXCEEDS_ESCROW", "Released capital cannot exceed escrowed capital");
  if (a.spent > a.released) throw new DomainInvariantError("SPENT_EXCEEDS_RELEASED", "Spent capital cannot exceed released capital");
  if (a.delivered > a.spent) throw new DomainInvariantError("DELIVERED_EXCEEDS_SPENT", "Delivered value cannot exceed spent capital");
  if (a.verifiedImpact > a.delivered) throw new DomainInvariantError("IMPACT_EXCEEDS_DELIVERED", "Verified impact cannot exceed delivered value");
}

export function validateCapitalIntent(intent: CapitalIntent) {
  assertAccounting(intent.amounts);
  return intent;
}

export function applyCapitalTransition(intent: CapitalIntent, transition: CapitalTransition, now = new Date().toISOString()): CapitalIntent {
  if (intent.state === "CANCELLED") throw new DomainInvariantError("INTENT_CANCELLED", "Cancelled capital intents cannot transition");
  const next: CapitalIntent = { ...intent, amounts: { ...intent.amounts }, version: intent.version + 1, updatedAt: now };

  switch (transition.type) {
    case "RAISE":
      positive(transition.amount);
      next.amounts.raised += transition.amount;
      next.state = "RAISED";
      break;
    case "MAKE_AVAILABLE":
      positive(transition.amount);
      if (intent.amounts.available + transition.amount > intent.amounts.raised)
        throw new DomainInvariantError("AVAILABLE_EXCEEDS_RAISED", "Cannot make more capital available than has been raised");
      next.amounts.available += transition.amount;
      next.state = "AVAILABLE";
      break;
    case "ALLOCATE":
      positive(transition.amount);
      if (intent.amounts.allocated + transition.amount > intent.amounts.available)
        throw new DomainInvariantError("INSUFFICIENT_AVAILABLE_CAPITAL", "Allocation exceeds available capital");
      next.amounts.allocated += transition.amount;
      next.state = "ALLOCATED";
      break;
    case "ESCROW":
      positive(transition.amount);
      if (intent.amounts.escrowed + transition.amount > intent.amounts.allocated)
        throw new DomainInvariantError("INSUFFICIENT_ALLOCATED_CAPITAL", "Escrow amount exceeds allocated capital");
      next.amounts.escrowed += transition.amount;
      next.state = "ESCROWED";
      break;
    case "MARK_RELEASE_READY":
      if (intent.amounts.escrowed <= intent.amounts.released)
        throw new DomainInvariantError("NO_RELEASABLE_ESCROW", "Release-ready state requires unreleased escrow");
      next.state = "RELEASE_READY";
      break;
    case "RELEASE":
      positive(transition.amount);
      if (intent.state !== "RELEASE_READY")
        throw new DomainInvariantError("NOT_RELEASE_READY", "Capital must pass release review before release");
      if (intent.amounts.released + transition.amount > intent.amounts.escrowed)
        throw new DomainInvariantError("RELEASE_EXCEEDS_ESCROW", "Release exceeds escrowed capital");
      next.amounts.released += transition.amount;
      next.state = "RELEASED";
      break;
    case "MARK_SPENT":
      positive(transition.amount);
      if (intent.amounts.spent + transition.amount > intent.amounts.released)
        throw new DomainInvariantError("SPEND_EXCEEDS_RELEASED", "Spend exceeds released capital");
      next.amounts.spent += transition.amount;
      next.state = "SPENT";
      break;
    case "MARK_DELIVERED":
      positive(transition.amount);
      if (intent.amounts.delivered + transition.amount > intent.amounts.spent)
        throw new DomainInvariantError("DELIVERY_EXCEEDS_SPEND", "Delivered value exceeds spent capital");
      next.amounts.delivered += transition.amount;
      next.state = "DELIVERED";
      break;
    case "VERIFY_IMPACT":
      positive(transition.amount);
      if (intent.amounts.verifiedImpact + transition.amount > intent.amounts.delivered)
        throw new DomainInvariantError("IMPACT_EXCEEDS_DELIVERY", "Verified impact exceeds delivered value");
      next.amounts.verifiedImpact += transition.amount;
      next.state = "VERIFIED_IMPACT";
      break;
    case "CANCEL":
      if (intent.amounts.released > 0n)
        throw new DomainInvariantError("CANNOT_CANCEL_RELEASED_CAPITAL", "Capital with released funds cannot be cancelled");
      next.state = "CANCELLED";
      break;
  }

  return validateCapitalIntent(next);
}

export function serializeCapitalIntent(intent: CapitalIntent) {
  return {
    ...intent,
    amounts: Object.fromEntries(Object.entries(intent.amounts).map(([k,v]) => [k, v.toString()])),
  };
}
