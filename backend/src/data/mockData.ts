import type { Alert, ChatMessage, Machine, TelemetryRecord, User } from "@machine-health/shared";

const machineNames = [
  { id: "machine-motor", code: "MTR-01", name: "Main Motor" },
  { id: "machine-conveyor", code: "CNV-02", name: "Primary Conveyor" },
  { id: "machine-scanner", code: "SCN-03", name: "Inspection Scanner" },
  { id: "machine-sorter", code: "SRT-04", name: "Sorting Arm" }
];

export const users: User[] = [
  { id: "user-operator", name: "Shift Operator", email: "operator@factory.local", role: "operator" },
  { id: "user-boss", name: "Operations Boss", email: "boss@factory.local", role: "boss" }
];

export const machines: Machine[] = machineNames.map((machine, index) => ({
  id: machine.id,
  machineCode: machine.code,
  name: machine.name,
  status: index === 3 ? "warning" : "healthy"
}));

const baseTime = Date.now() - 1000 * 60 * 60 * 11;

export const telemetry: TelemetryRecord[] = Array.from({ length: 48 }).flatMap((_, sampleIndex) =>
  machines.map((machine, machineIndex) => {
    const timestamp = new Date(baseTime + sampleIndex * 15 * 60 * 1000).toISOString();
    const temperature = 58 + machineIndex * 4 + Math.sin(sampleIndex / 3) * 5 + (machineIndex === 3 ? 5 : 0);
    const vibration = 1.8 + machineIndex * 0.35 + Math.abs(Math.cos(sampleIndex / 4)) * 0.8 + (machineIndex === 3 ? 0.6 : 0);
    const power = 84 + machineIndex * 10 + Math.sin(sampleIndex / 5) * 8;
    const rpm = 1180 + machineIndex * 110 + Math.cos(sampleIndex / 6) * 40;
    const wearScore = Math.min(95, 22 + sampleIndex * 0.9 + machineIndex * 6);
    const failureRisk = Math.min(0.96, 0.16 + sampleIndex * 0.01 + machineIndex * 0.05 + (machineIndex === 3 ? 0.12 : 0));
    const remainingLifeHours = Math.max(22, 260 - sampleIndex * 3 - machineIndex * 18);
    const nextHourPower = power * 1.04;

    return {
      id: `${machine.id}-${sampleIndex}`,
      machineId: machine.id,
      timestamp,
      temperature: Number(temperature.toFixed(2)),
      vibration: Number(vibration.toFixed(2)),
      power: Number(power.toFixed(2)),
      rpm: Number(rpm.toFixed(0)),
      wearScore: Number(wearScore.toFixed(2)),
      failureRisk: Number(failureRisk.toFixed(2)),
      remainingLifeHours: Number(remainingLifeHours.toFixed(2)),
      nextHourPower: Number(nextHourPower.toFixed(2))
    };
  })
);

export const alerts: Alert[] = [
  {
    id: "alert-1",
    machineId: "machine-sorter",
    message: "Sorting arm vibration approaching intervention threshold.",
    severity: "high",
    timestamp: new Date(baseTime + 46 * 15 * 60 * 1000).toISOString()
  },
  {
    id: "alert-2",
    machineId: "machine-scanner",
    message: "Scanner temperature trending above baseline envelope.",
    severity: "medium",
    timestamp: new Date(baseTime + 44 * 15 * 60 * 1000).toISOString()
  }
];

export const messages: ChatMessage[] = [
  {
    id: "msg-1",
    senderId: "user-operator",
    senderName: "Shift Operator",
    receiverId: "user-boss",
    role: "operator",
    message: "Sorting arm vibration is trending above expected tolerance. Monitoring closely.",
    timestamp: new Date(baseTime + 45 * 15 * 60 * 1000).toISOString()
  },
  {
    id: "msg-2",
    senderId: "user-boss",
    senderName: "Operations Boss",
    receiverId: "user-operator",
    role: "boss",
    message: "Keep the line running, but prepare a maintenance window if failure risk crosses 75%.",
    timestamp: new Date(baseTime + 46 * 15 * 60 * 1000).toISOString()
  }
];

