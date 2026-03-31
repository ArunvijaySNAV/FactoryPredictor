import type { MachineSnapshot, OperatorOverview, TelemetryRecord } from "@machine-health/shared";
import { store } from "../data/store.js";
import { buildAlerts, buildMaintenanceSuggestion, deriveMachineStatus } from "./predictionService.js";

type AggregatedTelemetryPoint = Pick<
  TelemetryRecord,
  | "id"
  | "machineId"
  | "timestamp"
  | "temperature"
  | "vibration"
  | "power"
  | "rpm"
  | "wearScore"
  | "failureRisk"
  | "remainingLifeHours"
  | "nextHourPower"
>;

function telemetryUnlocked() {
  return store.telemetryUploadCompleted;
}

function latestRecord(machineId: string) {
  return [...store.telemetry]
    .filter((entry) => entry.machineId === machineId)
    .sort((left, right) => left.timestamp.localeCompare(right.timestamp))
    .at(-1);
}

function buildTimeSeries(records: TelemetryRecord[]): AggregatedTelemetryPoint[] {
  const grouped = new Map<string, TelemetryRecord[]>();

  records.forEach((record) => {
    const bucket = grouped.get(record.timestamp) ?? [];
    bucket.push(record);
    grouped.set(record.timestamp, bucket);
  });

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([timestamp, entries], index) => {
      const count = Math.max(entries.length, 1);
      const sum = entries.reduce(
        (accumulator, entry) => ({
          temperature: accumulator.temperature + entry.temperature,
          vibration: accumulator.vibration + entry.vibration,
          power: accumulator.power + entry.power,
          rpm: accumulator.rpm + entry.rpm,
          wearScore: accumulator.wearScore + entry.wearScore,
          failureRisk: accumulator.failureRisk + entry.failureRisk,
          remainingLifeHours: accumulator.remainingLifeHours + entry.remainingLifeHours,
          nextHourPower: accumulator.nextHourPower + entry.nextHourPower
        }),
        {
          temperature: 0,
          vibration: 0,
          power: 0,
          rpm: 0,
          wearScore: 0,
          failureRisk: 0,
          remainingLifeHours: 0,
          nextHourPower: 0
        }
      );

      return {
        id: `aggregate-${index}`,
        machineId: "fleet",
        timestamp,
        temperature: Number((sum.temperature / count).toFixed(2)),
        vibration: Number((sum.vibration / count).toFixed(2)),
        power: Number((sum.power / count).toFixed(2)),
        rpm: Number((sum.rpm / count).toFixed(0)),
        wearScore: Number((sum.wearScore / count).toFixed(2)),
        failureRisk: Number((sum.failureRisk / count).toFixed(2)),
        remainingLifeHours: Number((sum.remainingLifeHours / count).toFixed(2)),
        nextHourPower: Number((sum.nextHourPower / count).toFixed(2))
      };
    });
}

export function syncMachineStatuses() {
  if (!telemetryUnlocked()) {
    return;
  }

  store.machines = store.machines.map((machine) => {
    const latest = latestRecord(machine.id);
    if (!latest) {
      return machine;
    }

    return { ...machine, status: deriveMachineStatus(latest) };
  });
}

export function getMachineSnapshot(machineId: string): MachineSnapshot | null {
  if (!telemetryUnlocked()) {
    return null;
  }

  syncMachineStatuses();

  const machine = store.machines.find((entry) => entry.id === machineId);
  const latest = latestRecord(machineId);
  if (!machine || !latest) {
    return null;
  }

  const generatedAlerts = buildAlerts(machine.id, latest);
  const mergedAlerts = [...store.alerts.filter((alert) => alert.machineId === machineId), ...generatedAlerts]
    .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
    .slice(0, 4);

  return {
    machine,
    latest,
    alerts: mergedAlerts,
    maintenanceSuggestion: buildMaintenanceSuggestion(latest)
  };
}

export function getOperatorOverview(): OperatorOverview {
  if (!telemetryUnlocked()) {
    return {
      summary: {
        liveMachines: 0,
        alertCount: 0,
        avgTemperature: 0,
        avgVibration: 0
      },
      machines: [],
      timeSeries: []
    };
  }

  syncMachineStatuses();
  const snapshots = store.machines
    .map((machine) => getMachineSnapshot(machine.id))
    .filter((entry): entry is MachineSnapshot => Boolean(entry));

  const latestByMachine = snapshots.map((entry) => entry.latest);
  const timeSeries = buildTimeSeries(store.telemetry);

  return {
    summary: {
      liveMachines: snapshots.length,
      alertCount: snapshots.reduce((sum, snapshot) => sum + snapshot.alerts.length, 0),
      avgTemperature:
        latestByMachine.reduce((sum, record) => sum + record.temperature, 0) / Math.max(latestByMachine.length, 1),
      avgVibration:
        latestByMachine.reduce((sum, record) => sum + record.vibration, 0) / Math.max(latestByMachine.length, 1)
    },
    machines: snapshots,
    timeSeries
  };
}

export function getTelemetryRows(): TelemetryRecord[] {
  if (!telemetryUnlocked()) {
    return [];
  }

  return [...store.telemetry].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
}
