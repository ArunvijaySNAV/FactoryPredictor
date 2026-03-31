import { Router } from "express";
import { getBossOverview } from "../services/bossService.js";
import { getOperatorOverview } from "../services/telemetryService.js";

export const overviewRoutes = Router();

overviewRoutes.get("/operator", (_request, response) => {
  response.json(getOperatorOverview());
});

overviewRoutes.get("/boss", (_request, response) => {
  response.json(getBossOverview());
});
