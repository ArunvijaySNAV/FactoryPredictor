import type { Alert, ChatMessage, DailyReport, Machine, TelemetryRecord, User } from "@machine-health/shared";
import { machines, users } from "./mockData.js";

class InMemoryStore {
  users: User[] = [...users];
  machines: Machine[] = [...machines];
  telemetry: TelemetryRecord[] = [];
  alerts: Alert[] = [];
  messages: ChatMessage[] = [];
  reports: DailyReport[] = [];
  telemetryUploadCompleted = false;
}

export const store = new InMemoryStore();
