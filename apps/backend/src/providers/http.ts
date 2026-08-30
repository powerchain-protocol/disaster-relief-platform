export class ProviderHttpError extends Error {
  constructor(
    public readonly provider: string,
    public readonly code: string,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ProviderHttpError";
  }
}

export async function providerFetch(
  provider: string,
  url: string,
  init: RequestInit = {},
  timeoutMs = 7_500,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
    if (!response.ok) {
      throw new ProviderHttpError(provider, `${provider}_HTTP_${response.status}`, `${provider} returned HTTP ${response.status}`, response.status);
    }
    return response;
  } catch (error) {
    if (error instanceof ProviderHttpError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ProviderHttpError(provider, `${provider}_TIMEOUT`, `${provider} timed out after ${timeoutMs}ms`);
    }
    throw new ProviderHttpError(provider, `${provider}_NETWORK_ERROR`, error instanceof Error ? error.message : `${provider} request failed`);
  } finally {
    clearTimeout(timer);
  }
}
