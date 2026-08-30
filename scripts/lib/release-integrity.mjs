import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export const sha256 = data => createHash("sha256").update(data).digest("hex");

export function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map(key => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
}

export function canonicalSha256(value) {
  return sha256(canonicalize(value));
}

export function fileSha256(path) {
  return sha256(readFileSync(path));
}
