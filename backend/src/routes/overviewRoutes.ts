import { Router } from "express";
import { getBossOverview } from "../services/bossService";
import { getOperatorOverview } from "../services/telemetryService";

export const overviewRoutes = Router();

overviewRoutes.get("/operator", (_request, response) => {
  response.json(getOperatorOverview());
});

overviewRoutes.get("/boss", (_request, response) => {
  response.json(getBossOverview());
});

