import { Router } from "express";
import { getMachineSnapshot } from "../services/telemetryService";

export const machineRoutes = Router();

machineRoutes.get("/:machineId", (request, response) => {
  const snapshot = getMachineSnapshot(request.params.machineId);
  if (!snapshot) {
    response.status(404).json({ message: "Machine not found" });
    return;
  }

  response.json(snapshot);
});

