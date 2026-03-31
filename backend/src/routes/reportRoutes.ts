import { Router } from "express";
import { createDailyReportPdf, generateDailyReport } from "../services/reportService.js";

export const reportRoutes = Router();

reportRoutes.get("/daily", async (request, response) => {
  try {
    const format = request.query.format;
    const report = await generateDailyReport();

    if (format === "pdf") {
      const pdf = await createDailyReportPdf(report);
      response.setHeader("Content-Type", "application/pdf");
      response.setHeader("Content-Disposition", `attachment; filename="daily-report-${report.date}.pdf"`);
      response.send(pdf);
      return;
    }

    response.json(report);
  } catch (error) {
    console.error(error);
    response.status(200).json({
      date: new Date().toISOString().slice(0, 10),
      summary: "Report fallback generated because live report generation was unavailable.",
      metrics: {
        totalMachinesMonitored: 0,
        avgTemperature: 0,
        avgVibration: 0,
        totalPower: 0,
        failureCount: 0,
        machinesAtRisk: [],
        predictedFailures: 0
      }
    });
  }
});
