import express from "express";
import cors from "cors";
import { authRoutes } from "./routes/authRoutes";
import { chatRoutes } from "./routes/chatRoutes";
import { machineRoutes } from "./routes/machineRoutes";
import { overviewRoutes } from "./routes/overviewRoutes";
import { reportRoutes } from "./routes/reportRoutes";
import { telemetryRoutes } from "./routes/telemetryRoutes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api", telemetryRoutes);
  app.use("/api/overview", overviewRoutes);
  app.use("/api/machines", machineRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/telemetry", telemetryRoutes);

  app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    console.error(error);
    response.status(500).json({ message: "Internal server error" });
  });

  return app;
}
