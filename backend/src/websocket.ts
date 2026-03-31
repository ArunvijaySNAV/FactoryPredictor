import type { Server as HttpServer } from "node:http";
import { WebSocketServer } from "ws";
import { createMessage } from "./services/chatService";

export function registerWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: "/ws/chat" });

  wss.on("connection", (socket) => {
    socket.on("message", async (raw) => {
      try {
        const payload = JSON.parse(raw.toString()) as {
          senderId: string;
          receiverId: string;
          role: "operator" | "boss";
          message: string;
        };

        const created = await createMessage(payload);
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(created));
          }
        });
      } catch {
        socket.send(JSON.stringify({ error: "Invalid message payload" }));
      }
    });
  });

  return wss;
}
