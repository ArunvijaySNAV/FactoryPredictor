import { Router } from "express";
import multer from "multer";
import { importTelemetryCsv } from "../services/csvIngestionService.js";
import { getTelemetryRows } from "../services/telemetryService.js";

const upload = multer();

export const telemetryRoutes = Router();

telemetryRoutes.get("/export", (_request, response) => {
  response.json(getTelemetryRows());
});

telemetryRoutes.post("/upload", upload.single("file"), (request, response) => {
  const file = request.file;
  if (!file) {
    response.status(400).json({ message: "CSV file is required" });
    return;
  }

  void importTelemetryCsv(file.buffer.toString("utf8"))
    .then((result) => {
      response.status(201).json(result);
    })
    .catch((error: Error) => {
      console.error(error);
      response.status(500).json({ message: error.message || "Telemetry import failed" });
    });
});

telemetryRoutes.post("/upload-csv", upload.single("file"), (request, response) => {
  const file = request.file;
  if (!file) {
    response.status(400).json({ message: "CSV file is required" });
    return;
  }

  void importTelemetryCsv(file.buffer.toString("utf8"))
    .then((result) => {
      response.status(201).json(result);
    })
    .catch((error: Error) => {
      console.error(error);
      response.status(500).json({ message: error.message || "Telemetry import failed" });
    });
});
