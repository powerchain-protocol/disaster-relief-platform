import { createHash, randomUUID } from "node:crypto";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a],[b]) => a.localeCompare(b))
        .map(([key,item]) => [key, canonicalize(item)]),
    );
  }
  if (typeof value === "bigint") return value.toString();
  return value;
}

export function canonicalJson(value: unknown) {
  return JSON.stringify(canonicalize(value));
}

export function sha256(value: unknown) {
  return createHash("sha256").update(typeof value === "string" ? value : canonicalJson(value)).digest("hex");
}

export type ImmutableReceipt = {
  id: string;
  kind: string;
  subjectId: string;
  payloadHashSha256: string;
  previousReceiptHashSha256: string | null;
  receiptHashSha256: string;
  createdAt: string;
};

export function createReceipt(kind: string, subjectId: string, payload: unknown, previousReceiptHashSha256: string | null = null, now = new Date().toISOString()): ImmutableReceipt {
  const base = {
    id: randomUUID(),
    kind,
    subjectId,
    payloadHashSha256: sha256(payload),
    previousReceiptHashSha256,
    createdAt: now,
  };
  return { ...base, receiptHashSha256: sha256(base) };
}

export class IdempotencyRegistry {
  private readonly entries = new Map<string,{ requestHash: string; response: unknown }>();

  execute<T>(key: string, request: unknown, factory: () => T): { replayed: boolean; response: T } {
    if (!key.trim()) throw new Error("IDEMPOTENCY_KEY_REQUIRED");
    const requestHash = sha256(request);
    const existing = this.entries.get(key);
    if (existing) {
      if (existing.requestHash !== requestHash) throw new Error("IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST");
      return { replayed: true, response: existing.response as T };
    }
    const response = factory();
    this.entries.set(key,{ requestHash,response });
    return { replayed: false,response };
  }
}
