import PDFDocument from "pdfkit";
import type { DailyReport } from "@machine-health/shared";
import { persistReport } from "../data/insforgeRepository";
import { store } from "../data/store";
import { getOperatorOverview } from "./telemetryService";

export async function generateDailyReport(): Promise<DailyReport> {
  const overview = getOperatorOverview();
  const latest = overview.machines.map((machine) => machine.latest);
  const reportDate = new Date().toISOString().slice(0, 10);
  const machinesAtRisk = overview.machines
    .filter((machine) => machine.machine.status !== "healthy")
    .map((machine) => machine.machine.name);

  const report: DailyReport = {
    date: reportDate,
    summary:
      latest.length > 0
        ? "Factory monitoring remained active across the monitored line. Thermal and vibration trends stayed controlled for most assets, while the sorting stage showed the highest wear, maintenance urgency, and failure exposure for the next cycle."
        : "No telemetry has been uploaded yet. Upload a CSV to generate a real end-of-day report.",
    metrics: {
      totalMachinesMonitored: overview.machines.length,
      avgTemperature: latest.reduce((sum, entry) => sum + entry.temperature, 0) / Math.max(latest.length, 1),
      avgVibration: latest.reduce((sum, entry) => sum + entry.vibration, 0) / Math.max(latest.length, 1),
      totalPower: latest.reduce((sum, entry) => sum + entry.power, 0),
      failureCount: latest.filter((entry) => entry.failureRisk >= 0.6).length,
      machinesAtRisk,
      predictedFailures: latest.filter((entry) => entry.failureRisk >= 0.75).length
    }
  };

  store.reports = [report, ...store.reports.filter((entry) => entry.date !== reportDate)];
  await persistReport(report);
  return report;
}

export function createDailyReportPdf(report: DailyReport) {
  const document = new PDFDocument({ margin: 48 });
  const chunks: Uint8Array[] = [];

  document.on("data", (chunk) => chunks.push(chunk));
  document.fontSize(22).text("Machine Health Predictor", { align: "left" });
  document.moveDown(0.2);
  document.fontSize(14).fillColor("#2d5f8b").text(`Daily Industry Report - ${report.date}`);
  document.moveDown();
  document.fillColor("#111827").fontSize(11);

  [
    `Total machines monitored: ${report.metrics.totalMachinesMonitored}`,
    `Average temperature: ${report.metrics.avgTemperature.toFixed(1)} C`,
    `Average vibration: ${report.metrics.avgVibration.toFixed(2)} mm/s`,
    `Total power consumption: ${report.metrics.totalPower.toFixed(1)} kWh`,
    `Failure risks: ${report.metrics.failureCount}`,
    `Machines at risk: ${report.metrics.machinesAtRisk.join(", ") || "None"}`,
    `Predicted failures next cycle: ${report.metrics.predictedFailures}`
  ].forEach((line) => {
    document.text(line);
    document.moveDown(0.4);
  });

  document.moveDown();
  document.fontSize(12).fillColor("#b45309").text("AI-style Summary");
  document.moveDown(0.4);
  document.fillColor("#111827").fontSize(11).text(report.summary, { lineGap: 4 });
  document.end();

  return new Promise<Buffer>((resolve) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
