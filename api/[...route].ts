import type { VercelRequest, VercelResponse } from "@vercel/node";

type AppHandler = (request: VercelRequest, response: VercelResponse) => unknown;

let appPromise: Promise<AppHandler> | null = null;

export const config = {
  api: {
    bodyParser: false
  }
};

async function getApp(): Promise<AppHandler> {
  if (!appPromise) {
    appPromise = import("../backend/src/app.js").then(({ createApp }) => createApp() as AppHandler);
  }

  return appPromise;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    const app = await getApp();

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
