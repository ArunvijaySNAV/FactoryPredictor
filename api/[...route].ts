import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../backend/src/app.js";

let app: ReturnType<typeof createApp> | null = null;

export const config = {
  api: {
    bodyParser: false
  }
};

export default function handler(request: VercelRequest, response: VercelResponse) {
  try {
    if (!app) {
      app = createApp();
    }

    return app(request, response);
  } catch (error) {
    console.error("Serverless handler failure", error);

    if (!response.headersSent) {
      response.status(500).json({
        message: error instanceof Error ? error.message : "Unknown server error"
      });
    }
  }
}
