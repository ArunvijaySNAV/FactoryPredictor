import { Router } from "express";
import { createMessage, getMessages } from "../services/chatService";

export const chatRoutes = Router();

chatRoutes.get("/messages", (_request, response) => {
  response.json(getMessages());
});

chatRoutes.post("/messages", async (request, response) => {
  try {
    const entry = await createMessage(request.body);
    response.status(201).json(entry);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Message send failed" });
  }
});
