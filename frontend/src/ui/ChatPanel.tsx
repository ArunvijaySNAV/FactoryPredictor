import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage, UserRole } from "@machine-health/shared";
import { motion } from "framer-motion";
import { getStoredUser } from "../auth/session";
import { api } from "../services/api";
import { usePolling } from "../hooks/usePolling";

export function ChatPanel({ role }: { role: UserRole }) {
  const [message, setMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const currentUser = getStoredUser();
  const identity = {
    id: currentUser?.id ?? (role === "operator" ? "user-operator" : "user-boss"),
    receiverId: role === "operator" ? "user-boss" : "user-operator"
  };
  const { data, setData } = usePolling(api.getMessages, 12000);
  const messages = useMemo(() => data ?? [], [data]);

  useEffect(() => {
    const socket = new WebSocket(`${window.location.origin.replace("http", "ws")}/ws/chat`);
    socketRef.current = socket;

    socket.onopen = () => setSocketConnected(true);
    socket.onclose = () => setSocketConnected(false);
    socket.onerror = () => setSocketConnected(false);
    socket.onmessage = (event) => {
      const parsed = JSON.parse(event.data) as ChatMessage;
      setData((current) => [...(current ?? []), parsed]);
    };

    return () => {
      socket.close();
    };
  }, [setData]);

  const sendMessage = async () => {
    if (!message.trim()) {
      return;
    }

    const payload = {
      senderId: identity.id,
      receiverId: identity.receiverId,
      role,
      message
    };

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    } else {
      const created = await api.sendMessage(payload);
      setData((current) => [...(current ?? []), created]);
    }
    setMessage("");
  };

  return (
    <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-panel backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl font-semibold text-steel-900">Command Channel</h3>
          <p className="text-sm text-steel-500">
            {socketConnected ? "Live WebSocket connected" : "Polling fallback active"}
          </p>
        </div>
        <span className="rounded-full bg-industrial-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-industrial-blue">
          {role}
        </span>
      </div>
      <div className="mt-4 flex h-72 flex-col gap-3 overflow-auto rounded-3xl bg-steel-50/70 p-4">
        {messages.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: entry.role === role ? 18 : -18 }}
            animate={{ opacity: 1, x: 0 }}
            className={`max-w-[82%] rounded-3xl px-4 py-3 ${
              entry.role === role ? "self-end bg-industrial-blue text-white" : "bg-white text-steel-900"
            }`}
          >
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] opacity-80">
              <span>{entry.senderName}</span>
              <span>{entry.role}</span>
              <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-sm leading-6">{entry.message}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={role === "operator" ? "Report machine issue or alert..." : "Respond with instructions..."}
          className="flex-1 rounded-2xl border border-steel-200 bg-white px-4 py-3 text-sm outline-none ring-industrial-blue transition focus:ring-2"
        />
        <button
          onClick={() => void sendMessage()}
          className="rounded-2xl bg-industrial-amber px-5 py-3 font-semibold text-steel-900 transition hover:brightness-105"
        >
          Send
        </button>
      </div>
    </div>
  );
}
