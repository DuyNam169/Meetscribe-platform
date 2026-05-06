import { useEffect, useRef, useCallback } from "react";

const WS_BASE = `ws://${window.location.hostname}:8000`;

export function useWebSocket(meetingId, onMessage) {
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    if (!meetingId) return;

    const ws = new WebSocket(`${WS_BASE}/ws/transcribe/${meetingId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error("[useWebSocket] parse error", e);
      }
    };

    ws.onerror = (err) => {
      console.error("[useWebSocket] error", err);
    };

    ws.onclose = () => {
      console.log("[useWebSocket] closed");
    };

    return ws;
  }, [meetingId, onMessage]);

  const send = useCallback((payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, send, disconnect };
}
