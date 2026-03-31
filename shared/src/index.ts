export type UserRole = "operator" | "boss";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Machine {
  id: string;
  machineCode: string;
  name: string;
  status: "healthy" | "warning" | "critical" | "maintenance";
}

export interface TelemetryRecord {
  id: string;
  machineId: string;
  timestamp: string;
  temperature: number;
  vibration: number;
  power: number;
  rpm: number;
  wearScore: number;
  failureRisk: number;
  remainingLifeHours: number;
  nextHourPower: number;
}

export interface Alert {
  id: string;
  machineId: string;
  message: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  role: UserRole;
  message: string;
  timestamp: string;
}

export interface MachineSnapshot {
  machine: Machine;
  latest: TelemetryRecord;
  alerts: Alert[];
  maintenanceSuggestion: string;
}

export interface OperatorOverview {
  summary: {
    liveMachines: number;
    alertCount: number;
    avgTemperature: number;
    avgVibration: number;
  };
  machines: MachineSnapshot[];
  timeSeries: TelemetryRecord[];
}

export interface BossOverview {
  totalMachines: number;
  riskyMachines: number;
  totalPower: number;
  averageWearScore: number;
  predictedFailures: number;
  dailySummary: string;
  energyTrend: Array<{ timestamp: string; power: number }>;
  fleetHealth: Array<{ label: string; value: number }>;
}

export interface DailyReport {
  date: string;
  summary: string;
  metrics: {
    totalMachinesMonitored: number;
    avgTemperature: number;
    avgVibration: number;
    totalPower: number;
    failureCount: number;
    machinesAtRisk: string[];
    predictedFailures: number;
  };
}

export interface UploadResponse {
  importedRows: number;
  machinesAffected: number;
}

export interface AuthConfig {
  oAuthProviders: string[];
  requireEmailVerification: boolean;
  passwordMinLength: number;
  verifyEmailMethod: "code" | "link";
}
