import type { BossOverview, Machine } from "@machine-health/shared";
import { getOperatorOverview } from "./telemetryService";

export function getBossOverview(): BossOverview {
  const operatorOverview = getOperatorOverview();
  const latest = operatorOverview.machines.map((machine) => machine.latest);
  const fleetHealth = latest.reduce<Record<Machine["status"], number>>(
    (accumulator, entry) => {
      const machine = operatorOverview.machines.find((snapshot) => snapshot.latest.id === entry.id)?.machine;
      if (machine) {
        accumulator[machine.status] += 1;
      }
      return accumulator;
    },
    {
      healthy: 0,
      warning: 0,
      critical: 0,
      maintenance: 0
    }
  );

  return {
    totalMachines: operatorOverview.machines.length,
    riskyMachines: latest.filter((entry) => entry.failureRisk >= 0.6).length,
    totalPower: latest.reduce((sum, entry) => sum + entry.power, 0),
    averageWearScore: latest.reduce((sum, entry) => sum + entry.wearScore, 0) / Math.max(latest.length, 1),
    predictedFailures: latest.filter((entry) => entry.failureRisk >= 0.75).length,
    dailySummary:
      latest.length > 0
        ? "Line throughput remained stable with concentrated wear developing around the sorting stage. Energy demand is within expected range, but targeted maintenance should be scheduled before the next heavy-load cycle."
        : "No telemetry has been uploaded yet. Upload a CSV to generate an executive overview from real machine data.",
    energyTrend: operatorOverview.timeSeries.slice(-18).map((entry) => ({
      timestamp: entry.timestamp,
      power: entry.power
    })),
    fleetHealth: [
      { label: "Healthy", value: fleetHealth.healthy },
      { label: "Warning", value: fleetHealth.warning },
      { label: "Critical", value: fleetHealth.critical },
      { label: "Maintenance", value: fleetHealth.maintenance }
    ]
  };
}
