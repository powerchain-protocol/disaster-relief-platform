"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function usePollingResource<T>(loader: () => Promise<T>, intervalMs = 30_000, staleAfterMs = intervalMs * 3) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [failureCount, setFailureCount] = useState(0);
  const [stale, setStale] = useState(false);
  const active = useRef(true);
  const hasData = useRef(false);
  const inFlight = useRef<Promise<void> | null>(null);
  const lastSuccessMs = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (inFlight.current) return inFlight.current;
    const task = (async () => {
      if (!hasData.current) setLoading(true); else setRefreshing(true);
      try {
        const next = await loader();
        if (!active.current) return;
        const now = Date.now();
        hasData.current = true;
        lastSuccessMs.current = now;
        setData(next); setError(null); setFailureCount(0); setStale(false); setUpdatedAt(new Date(now).toISOString());
      } catch (err) {
        if (!active.current) return;
        setFailureCount(value => value + 1);
        setError(err instanceof Error ? err.message : "Request failed");
        if (lastSuccessMs.current != null) setStale(Date.now() - lastSuccessMs.current > staleAfterMs);
      } finally {
        if (active.current) { setLoading(false); setRefreshing(false); }
        inFlight.current = null;
      }
    })();
    inFlight.current = task;
    return task;
  }, [loader, staleAfterMs]);

  useEffect(() => {
    active.current = true;
    let timer: number | undefined;
    const schedule = () => {
      const delay = document.visibilityState === "hidden" ? Math.max(intervalMs * 4, 60_000) : intervalMs;
      timer = window.setTimeout(async () => { await refresh(); if (active.current) schedule(); }, delay);
    };
    void refresh().finally(() => { if (active.current) schedule(); });
    const onVisibility = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { active.current = false; if (timer) window.clearTimeout(timer); document.removeEventListener("visibilitychange", onVisibility); };
  }, [intervalMs, refresh]);

  return { data, error, loading, refreshing, updatedAt, failureCount, stale, refresh };
}
