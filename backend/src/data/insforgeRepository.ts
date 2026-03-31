import type { Alert, ChatMessage, DailyReport, Machine, TelemetryRecord, User } from "@machine-health/shared";
import { store } from "./store.js";
import { insforge } from "./insforgeClient.js";

type DbUser = {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  role: User["role"];
};

type DbMachine = {
  id: string;
  machine_code: string;
  name: string;
  status: Machine["status"];
};

type DbTelemetry = {
  id: string;
  machine_id: string;
  timestamp: string;
  temperature: number;
  vibration: number;
  power: number;
  rpm: number;
  wear_score: number;
};

type DbPrediction = {
  id: string;
  machine_id: string;
  timestamp: string;
  failure_risk: number;
  remaining_life_hours: number;
  next_hour_power: number;
};

type DbAlert = {
  id: string;
  machine_id: string;
  message: string;
  severity: Alert["severity"];
  timestamp: string;
};

type DbMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  role: ChatMessage["role"];
  message: string;
  timestamp: string;
};

type DbReport = {
  id: string;
  date: string;
  summary_json: DailyReport;
};

function toUser(record: DbUser): User {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role
  };
}

function toMachine(record: DbMachine): Machine {
  return {
    id: record.id,
    machineCode: record.machine_code,
    name: record.name,
    status: record.status
  };
}

function toAlert(record: DbAlert): Alert {
  return {
    id: record.id,
    machineId: record.machine_id,
    message: record.message,
    severity: record.severity,
    timestamp: record.timestamp
  };
}

function buildTelemetryRecords(telemetryRows: DbTelemetry[], predictionRows: DbPrediction[]): TelemetryRecord[] {
  const predictionMap = new Map(predictionRows.map((row) => [`${row.machine_id}|${row.timestamp}`, row]));

  return telemetryRows.map((row) => {
    const prediction = predictionMap.get(`${row.machine_id}|${row.timestamp}`);

    return {
      id: row.id,
      machineId: row.machine_id,
      timestamp: row.timestamp,
      temperature: Number(row.temperature),
      vibration: Number(row.vibration),
      power: Number(row.power),
      rpm: Number(row.rpm),
      wearScore: Number(row.wear_score),
      failureRisk: Number(prediction?.failure_risk ?? 0),
      remainingLifeHours: Number(prediction?.remaining_life_hours ?? 0),
      nextHourPower: Number(prediction?.next_hour_power ?? row.power)
    };
  });
}

function toChatMessage(record: DbMessage): ChatMessage {
  const sender = store.users.find((user) => user.id === record.sender_id);

  return {
    id: record.id,
    senderId: record.sender_id,
    senderName: sender?.name ?? "Factory User",
    receiverId: record.receiver_id,
    role: record.role,
    message: record.message,
    timestamp: record.timestamp
  };
}

export async function hydrateStoreFromInsforge() {
  const [usersResult, machinesResult, telemetryResult, predictionsResult, alertsResult, messagesResult, reportsResult] =
    await Promise.all([
      insforge.database.from("users").select("id, name, email, password_hash, role").order("id", { ascending: true }),
      insforge.database.from("machines").select("id, machine_code, name, status").order("name", { ascending: true }),
      insforge.database
        .from("telemetry")
        .select("id, machine_id, timestamp, temperature, vibration, power, rpm, wear_score")
        .order("timestamp", { ascending: true }),
      insforge.database
        .from("predictions")
        .select("id, machine_id, timestamp, failure_risk, remaining_life_hours, next_hour_power")
        .order("timestamp", { ascending: true }),
      insforge.database.from("alerts").select("id, machine_id, message, severity, timestamp").order("timestamp", {
        ascending: false
      }),
      insforge.database.from("messages").select("id, sender_id, receiver_id, role, message, timestamp").order("timestamp", {
        ascending: true
      }),
      insforge.database.from("reports").select("id, date, summary_json").order("date", { ascending: false })
    ]);

  if (usersResult.error || machinesResult.error || telemetryResult.error || predictionsResult.error) {
    throw usersResult.error ?? machinesResult.error ?? telemetryResult.error ?? predictionsResult.error;
  }

  const users = ((usersResult.data as DbUser[] | null) ?? []).map(toUser);
  if (users.length > 0) {
    store.users = users;
  }

  const machines = ((machinesResult.data as DbMachine[] | null) ?? []).map(toMachine);
  if (machines.length > 0) {
    store.machines = machines;
  }

  const telemetryRows = (telemetryResult.data as DbTelemetry[] | null) ?? [];
  const predictionRows = (predictionsResult.data as DbPrediction[] | null) ?? [];
  if (telemetryRows.length > 0) {
    store.telemetry = buildTelemetryRecords(telemetryRows, predictionRows);
  }

  store.alerts = ((alertsResult.data as DbAlert[] | null) ?? []).map(toAlert);
  store.messages = ((messagesResult.data as DbMessage[] | null) ?? []).map(toChatMessage);
  store.reports = ((reportsResult.data as DbReport[] | null) ?? []).map((entry) => entry.summary_json);
}

export async function getDbUserByEmail(email: string) {
  const result = await insforge.database
    .from("users")
    .select("id, name, email, password_hash, role")
    .eq("email", email)
    .maybeSingle();

  if (result.error) {
    throw result.error;
  }

  return (result.data as DbUser | null) ?? null;
}

export async function upsertAppUser(user: {
  id: string;
  name: string;
  email: string;
  role: User["role"];
  passwordHash?: string | null;
}) {
  const result = await insforge.database.from("users").upsert(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash ?? "managed-by-insforge-auth",
      role: user.role
    },
    { onConflict: "id" }
  );

  if (result.error) {
    throw result.error;
  }

  const normalizedUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const existingIndex = store.users.findIndex((entry) => entry.id === normalizedUser.id);
  if (existingIndex >= 0) {
    store.users[existingIndex] = normalizedUser;
  } else {
    store.users.push(normalizedUser);
  }

  return normalizedUser;
}

export async function persistTelemetryImport(payload: {
  machines: Machine[];
  telemetry: TelemetryRecord[];
  alerts: Alert[];
}) {
  const machineRows = payload.machines.map((machine) => ({
    id: machine.id,
    machine_code: machine.machineCode,
    name: machine.name,
    status: machine.status
  }));

  const telemetryRows = payload.telemetry.map((entry) => ({
    id: entry.id,
    machine_id: entry.machineId,
    timestamp: entry.timestamp,
    temperature: entry.temperature,
    vibration: entry.vibration,
    power: entry.power,
    rpm: entry.rpm,
    wear_score: entry.wearScore
  }));

  const predictionRows = payload.telemetry.map((entry) => ({
    id: entry.id,
    machine_id: entry.machineId,
    timestamp: entry.timestamp,
    failure_risk: entry.failureRisk,
    remaining_life_hours: entry.remainingLifeHours,
    next_hour_power: entry.nextHourPower
  }));

  const alertRows = payload.alerts.map((alert) => ({
    id: alert.id,
    machine_id: alert.machineId,
    message: alert.message,
    severity: alert.severity,
    timestamp: alert.timestamp
  }));

  await insforge.database.from("alerts").delete().neq("id", "__empty__");
  await insforge.database.from("predictions").delete().neq("id", "__empty__");
  await insforge.database.from("telemetry").delete().neq("id", "__empty__");
  await insforge.database.from("machines").delete().neq("id", "__empty__");

  if (machineRows.length > 0) {
    const machineResult = await insforge.database.from("machines").insert(machineRows);
    if (machineResult.error) {
      throw machineResult.error;
    }
  }

  if (telemetryRows.length > 0) {
    const telemetryResult = await insforge.database.from("telemetry").insert(telemetryRows);
    if (telemetryResult.error) {
      throw telemetryResult.error;
    }

    const predictionResult = await insforge.database.from("predictions").insert(predictionRows);
    if (predictionResult.error) {
      throw predictionResult.error;
    }
  }

  if (alertRows.length > 0) {
    const alertResult = await insforge.database.from("alerts").insert(alertRows);
    if (alertResult.error) {
      throw alertResult.error;
    }
  }
}

export async function persistMessage(message: ChatMessage) {
  const result = await insforge.database.from("messages").insert({
    id: message.id,
    sender_id: message.senderId,
    receiver_id: message.receiverId,
    role: message.role,
    message: message.message,
    timestamp: message.timestamp
  });

  if (result.error) {
    throw result.error;
  }
}

export async function persistReport(report: DailyReport) {
  const result = await insforge.database.from("reports").upsert(
    {
      id: `report-${report.date}`,
      date: report.date,
      summary_json: report
    },
    { onConflict: "date" }
  );

  if (result.error) {
    throw result.error;
  }
}
