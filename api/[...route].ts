import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../backend/src/app.js";

const app = createApp();

export const config = {
  api: {
    bodyParser: false
  }
};

export default function handler(request: VercelRequest, response: VercelResponse) {
  return app(request, response);
}
