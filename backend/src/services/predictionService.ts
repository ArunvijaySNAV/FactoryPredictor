import type { Alert, Machine, TelemetryRecord } from "@machine-health/shared";

export function deriveMachineStatus(latest: TelemetryRecord): Machine["status"] {
  if (latest.failureRisk >= 0.78 || latest.vibration >= 3.2 || latest.temperature >= 82) {
    return "critical";
  }
  if (latest.failureRisk >= 0.56 || latest.vibration >= 2.7 || latest.temperature >= 74) {
    return "warning";
  }
  if (latest.remainingLifeHours <= 48) {
    return "maintenance";
  }
  return "healthy";
}

export function buildMaintenanceSuggestion(latest: TelemetryRecord): string {
  const issues: string[] = [];
  const actions: string[] = [];

  if (latest.temperature >= 82) {
    issues.push(`temperature is critically high at ${latest.temperature.toFixed(1)} C`);
    actions.push("inspect cooling airflow and lubrication immediately");
  } else if (latest.temperature >= 74) {
    issues.push(`temperature is elevated at ${latest.temperature.toFixed(1)} C`);
    actions.push("check airflow restriction and lubricant condition");
  }

  if (latest.vibration >= 3.2) {
    issues.push(`vibration is severe at ${latest.vibration.toFixed(2)} mm/s`);
    actions.push("verify bearing condition, shaft alignment, and coupling tightness");
  } else if (latest.vibration >= 2.8) {
    issues.push(`vibration is trending high at ${latest.vibration.toFixed(2)} mm/s`);
    actions.push("inspect alignment and rebalance the driven assembly");
  }

  if (latest.wearScore >= 70) {
    issues.push(`wear score is high at ${latest.wearScore.toFixed(1)}`);
    actions.push("prepare replacement for the wear-prone components");
  } else if (latest.wearScore >= 55) {
    issues.push(`wear score is rising at ${latest.wearScore.toFixed(1)}`);
    actions.push("schedule a closer inspection during the next planned stop");
  }

  if (latest.remainingLifeHours <= 24) {
    issues.push(`remaining life is down to ${latest.remainingLifeHours.toFixed(0)} hours`);
    actions.push("book maintenance in the next shift window");
  } else if (latest.remainingLifeHours <= 48) {
    issues.push(`remaining life is limited to ${latest.remainingLifeHours.toFixed(0)} hours`);
    actions.push("reserve a maintenance slot within 48 hours");
  }

  if (latest.failureRisk >= 0.85) {
    actions.unshift("reduce throughput now and inspect the machine before the next cycle");
  } else if (latest.failureRisk >= 0.7) {
    actions.unshift("run the machine under supervision and avoid peak-load operation");
  }

  if (issues.length === 0) {
    return `Current readings are within operating range. Keep the machine in service, continue routine checks, and review again if failure risk moves above ${(latest.failureRisk * 100).toFixed(0)}%.`;
  }

  const headline =
    latest.failureRisk >= 0.85
      ? "Immediate action recommended"
      : latest.failureRisk >= 0.7 || latest.remainingLifeHours <= 48
        ? "Short-term maintenance planning required"
        : "Condition-based maintenance recommended";

  return `${headline}: ${issues.join(", ")}. Next actions: ${[...new Set(actions)].join("; ")}.`;
}

export function buildAlerts(machineId: string, latest: TelemetryRecord) {
  const alerts: Array<Omit<Alert, "timestamp">> = [];

  if (latest.temperature >= 74) {
    alerts.push({
      id: `${machineId}-temp-${latest.id}`,
      machineId,
      message: `Temperature elevated to ${latest.temperature.toFixed(1)} C.`,
      severity: latest.temperature >= 82 ? "high" : "medium"
    });
  }

  if (latest.vibration >= 2.8) {
    alerts.push({
      id: `${machineId}-vib-${latest.id}`,
      machineId,
      message: `Vibration drift detected at ${latest.vibration.toFixed(2)} mm/s.`,
      severity: latest.vibration >= 3.2 ? "high" : "medium"
    });
  }

  if (latest.failureRisk >= 0.75) {
    alerts.push({
      id: `${machineId}-risk-${latest.id}`,
      machineId,
      message: `Failure risk has reached ${(latest.failureRisk * 100).toFixed(0)}%.`,
      severity: "high"
    });
  }

  return alerts.map((alert) => ({
    ...alert,
    timestamp: latest.timestamp
  }));
}
