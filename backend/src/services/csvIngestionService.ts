import { parse } from "csv-parse/sync";
import type { Machine, TelemetryRecord, UploadResponse } from "@machine-health/shared";
import { persistTelemetryImport } from "../data/insforgeRepository";
import { store } from "../data/store";
import { buildAlerts } from "./predictionService";
import { syncMachineStatuses } from "./telemetryService";

type CsvRow = {
  time: string;
  machine_id: string;
  temperature: string;
  vibration: string;
  power: string;
  rpm: string;
  wear_score: string;
  failure_risk: string;
  remaining_life_hours: string;
  next_hour_power: string;
};

type ParsedTimeValue =
  | { kind: "absolute"; iso: string }
  | { kind: "relative"; value: number };

function parseTimeValue(value: string, rowNumber: number): ParsedTimeValue {
  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    return {
      kind: "relative",
      value: numericValue
    };
  }

  const timestamp = new Date(value);
  if (!Number.isNaN(timestamp.getTime())) {
    return {
      kind: "absolute",
      iso: timestamp.toISOString()
    };
  }

  throw new Error(`Invalid timestamp at CSV row ${rowNumber}: "${value}"`);
}

function resolveTimestamps(rows: CsvRow[]) {
  const parsedTimes = rows.map((row, index) => parseTimeValue(row.time, index + 2));
  const relativeTimes = parsedTimes.filter((entry): entry is Extract<ParsedTimeValue, { kind: "relative" }> => entry.kind === "relative");

  if (relativeTimes.length === 0) {
    return parsedTimes.map((entry) => (entry.kind === "absolute" ? entry.iso : entry.value.toString()));
  }

  if (relativeTimes.length !== parsedTimes.length) {
    throw new Error("CSV time column must use either all numeric offsets or all date timestamps.");
  }

  const maxRelativeTime = Math.max(...relativeTimes.map((entry) => entry.value));
  const latestTimestamp = Date.now();

  return relativeTimes.map((entry) => {
    const hoursBehindLatest = maxRelativeTime - entry.value;
    return new Date(latestTimestamp - hoursBehindLatest * 60 * 60 * 1000).toISOString();
  });
}

function parseNumericField(value: string, fieldName: keyof Omit<CsvRow, "time" | "machine_id">, rowNumber: number) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    throw new Error(`Invalid ${fieldName} at CSV row ${rowNumber}: "${value}"`);
  }

  return numericValue;
}

function titleizeMachine(machineId: string) {
  return machineId
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (segment) => segment.toUpperCase());
}

export async function importTelemetryCsv(content: string): Promise<UploadResponse> {
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as CsvRow[];

  if (rows.length === 0) {
    throw new Error("CSV file is empty.");
  }

  const timestamps = resolveTimestamps(rows);

  const machineIds = new Set<string>();
  const records: TelemetryRecord[] = rows.map((row, index) => {
    const rowNumber = index + 2;
    if (!row.machine_id?.trim()) {
      throw new Error(`Missing machine_id at CSV row ${rowNumber}`);
    }

    machineIds.add(row.machine_id);
    return {
      id: `csv-${Date.now()}-${index}`,
      machineId: row.machine_id,
      timestamp: timestamps[index],
      temperature: parseNumericField(row.temperature, "temperature", rowNumber),
      vibration: parseNumericField(row.vibration, "vibration", rowNumber),
      power: parseNumericField(row.power, "power", rowNumber),
      rpm: parseNumericField(row.rpm, "rpm", rowNumber),
      wearScore: parseNumericField(row.wear_score, "wear_score", rowNumber),
      failureRisk: parseNumericField(row.failure_risk, "failure_risk", rowNumber),
      remainingLifeHours: parseNumericField(row.remaining_life_hours, "remaining_life_hours", rowNumber),
      nextHourPower: parseNumericField(row.next_hour_power, "next_hour_power", rowNumber)
    };
  });

  const machineMap = new Map(store.machines.map((machine) => [machine.id, machine]));
  const activeMachines: Machine[] = [...machineIds].map((machineId) => {
    const existing = machineMap.get(machineId);
    if (existing) {
      return existing;
    }

    return {
      id: machineId,
      machineCode: machineId.toUpperCase(),
      name: titleizeMachine(machineId),
      status: "healthy"
    };
  });

  store.machines = activeMachines;
  store.telemetry = records;
  store.telemetryUploadCompleted = true;
  syncMachineStatuses();

  const latestAlerts = [...machineIds]
    .map((machineId) =>
      [...records]
        .filter((record) => record.machineId === machineId)
        .sort((left, right) => left.timestamp.localeCompare(right.timestamp))
        .at(-1)
    )
    .filter((entry): entry is TelemetryRecord => Boolean(entry))
    .flatMap((entry) => buildAlerts(entry.machineId, entry));

  store.alerts = latestAlerts;

  await persistTelemetryImport({
    machines: [...store.machines],
    telemetry: records,
    alerts: latestAlerts
  });

  return {
    importedRows: records.length,
    machinesAffected: machineIds.size
  };
}
