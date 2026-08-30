export type HealthLevel = "healthy" | "degraded" | "unavailable" | "warming";

export function healthLevel(input: { ready?: boolean | null; providerStatus?: string | null; sloEvaluable?: boolean | null; sloOk?: boolean | null }): HealthLevel {
  if (input.ready === false || input.providerStatus === "UNAVAILABLE") return "unavailable";
  if (input.sloEvaluable === false) return "warming";
  if (input.ready === true && input.providerStatus === "LIVE" && input.sloOk !== false) return "healthy";
  return "degraded";
}
export function healthLabel(level: HealthLevel) {
  return level === "healthy" ? "Operational" : level === "warming" ? "Warming" : level === "unavailable" ? "Unavailable" : "Degraded";
}
