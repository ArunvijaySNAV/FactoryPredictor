import type { ChatMessage, UserRole } from "@machine-health/shared";
import { persistMessage } from "../data/insforgeRepository";
import { store } from "../data/store";

export function getMessages() {
  return [...store.messages].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
}

export async function createMessage(payload: {
  senderId: string;
  receiverId: string;
  role: UserRole;
  message: string;
}) {
  const senderName = payload.role === "operator" ? "Shift Operator" : "Operations Boss";
  const entry: ChatMessage = {
    id: `msg-${Date.now()}`,
    senderId: payload.senderId,
    senderName,
    receiverId: payload.receiverId,
    role: payload.role,
    message: payload.message,
    timestamp: new Date().toISOString()
  };

  store.messages.push(entry);
  await persistMessage(entry);
  return entry;
}
