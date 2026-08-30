"use client";

import { useEffect, useRef, useState } from "react";
export type SolanaStreamState = "CONNECTING" | "LIVE" | "RECONNECTING" | "OFFLINE";

export function useSolanaStream(enabled = true) {
  const [state, setState] = useState<SolanaStreamState>(enabled ? "CONNECTING" : "OFFLINE");
  const [lastMessageAt, setLastMessageAt] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const retry = useRef(0);

  useEffect(() => {
    if (!enabled) { setState("OFFLINE"); return; }
    let socket: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      setState(retry.current ? "RECONNECTING" : "CONNECTING");
      const protocol = location.protocol === "https:" ? "wss:" : "ws:";
      socket = new WebSocket(`${protocol}//${location.host}/api/v1/ws/solana`);
      socket.onopen = () => {
        retry.current = 0;
        setState("LIVE");
        setLastError(null);
        socket?.send(JSON.stringify({ type: "subscribe", topics: ["overview", "programs"] }));
      };
      socket.onmessage = event => {
        setLastMessageAt(new Date().toISOString());
        try {
          const payload = JSON.parse(String(event.data));
          if (payload?.type === "error") setLastError(String(payload.code ?? "STREAM_ERROR"));
        } catch { setLastError("INVALID_STREAM_PAYLOAD"); }
      };
      socket.onerror = () => setLastError("WEBSOCKET_ERROR");
      socket.onclose = () => {
        if (stopped) return;
        setState("RECONNECTING");
        retry.current += 1;
        const delay = Math.min(30_000, 1000 * 2 ** Math.min(retry.current, 5));
        timer = setTimeout(connect, delay);
      };
    };

    connect();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      socket?.close(1000, "component unmounted");
    };
  }, [enabled]);

  return { state, lastMessageAt, lastError };
}
