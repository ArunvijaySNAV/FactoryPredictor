import { useEffect, useState } from "react";
import type { MachineSnapshot } from "@machine-health/shared";
import { Activity, Gauge, Thermometer, TriangleAlert, Zap } from "lucide-react";
import { api } from "../services/api";
import { AuthActions } from "../ui/AuthActions";
import { ChatPanel } from "../ui/ChatPanel";
import { IndustrialBackground } from "../ui/IndustrialBackground";
import { MetricCard } from "../ui/MetricCard";
import { StatusPill } from "../ui/StatusPill";
import { TelemetryChart } from "../ui/TelemetryChart";
import { usePolling } from "../hooks/usePolling";

export function OperatorDashboardPage() {
  const { data, loading } = usePolling(api.getOperatorOverview, 10000);
  const [selectedMachine, setSelectedMachine] = useState<MachineSnapshot | null>(null);
  const hasTelemetry = Boolean(data?.machines.length);

  useEffect(() => {
    if (!selectedMachine && data?.machines?.length) {
      setSelectedMachine(data.machines[0]);
    }

    if (selectedMachine && !data?.machines.some((machine) => machine.machine.id === selectedMachine.machine.id)) {
      setSelectedMachine(data?.machines[0] ?? null);
    }
  }, [data, selectedMachine]);

  const refreshSelected = async (machineId: string) => {
    const details = await api.getMachine(machineId);
    setSelectedMachine(details);
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 lg:px-10">
      <IndustrialBackground />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-industrial-blue">Operator Command View</p>
            <h1 className="mt-3 font-display text-5xl font-semibold">Machine-level predictive monitoring</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-steel-500">
              Live thermal, vibration, power, and wear signals from the digital twin with maintenance recommendations and command chat.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 lg:items-end">
            <AuthActions />
            <label className="rounded-2xl border border-steel-200 bg-white/70 px-4 py-3 shadow-panel">
              <span className="mr-4 text-sm font-semibold text-steel-500">Upload telemetry CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void api.uploadTelemetry(file).then(() => window.location.reload());
                  }
                }}
                className="text-sm"
              />
            </label>
          </div>
        </div>

        {loading || !data ? (
          <div className="mt-10 rounded-[30px] bg-white/70 p-8 shadow-panel">Loading operator telemetry...</div>
        ) : !hasTelemetry ? (
          <div className="mt-10 rounded-[30px] border border-dashed border-steel-200 bg-white/75 p-10 shadow-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-industrial-blue">No telemetry yet</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-steel-900">Upload a real CSV to start the dashboard.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-steel-500">
              The operator view now waits for uploaded or hydrated telemetry instead of showing seeded demo values. Once a telemetry CSV is uploaded, live machine snapshots, alerts, charts, and recommendations will populate from that data.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Avg Temperature" value={`${data.summary.avgTemperature.toFixed(1)} C`} delta="Thermal trend stable" icon={Thermometer} />
              <MetricCard label="Avg Vibration" value={`${data.summary.avgVibration.toFixed(2)} mm/s`} delta="Watch sorter arm spikes" icon={Activity} />
              <MetricCard label="Live Machines" value={`${data.summary.liveMachines}`} delta="Factory line active" icon={Gauge} />
              <MetricCard label="Alerts" value={`${data.summary.alertCount}`} delta="Immediate triage required" icon={TriangleAlert} />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <div className="grid gap-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <TelemetryChart data={data.timeSeries.slice(-12)} dataKey="temperature" title="Temperature Flow" color="#f1a42b" />
                  <TelemetryChart data={data.timeSeries.slice(-12)} dataKey="power" title="Power Draw" color="#2d5f8b" />
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <TelemetryChart data={data.timeSeries.slice(-12)} dataKey="vibration" title="Vibration Drift" color="#d97706" />
                  <TelemetryChart data={data.timeSeries.slice(-12)} dataKey="rpm" title="RPM Stability" color="#5d7286" />
                </div>
                <ChatPanel role="operator" />
              </div>

              <div className="grid gap-6">
                <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-panel backdrop-blur">
                  <h2 className="font-display text-2xl font-semibold">Machines</h2>
                  <div className="mt-5 grid gap-3">
                    {data.machines.map((machine) => (
                      <button
                        key={machine.machine.id}
                        onClick={() => void refreshSelected(machine.machine.id)}
                        className="rounded-3xl border border-steel-200 bg-steel-50/70 p-4 text-left transition hover:border-industrial-blue"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-display text-xl font-semibold">{machine.machine.name}</p>
                            <p className="text-xs uppercase tracking-[0.22em] text-steel-400">{machine.machine.machineCode}</p>
                          </div>
                          <StatusPill status={machine.machine.status} />
                        </div>
                        <p className="mt-3 text-sm text-steel-500">
                          Wear {machine.latest.wearScore.toFixed(1)} | Risk {(machine.latest.failureRisk * 100).toFixed(0)}%
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedMachine && (
                  <div className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white to-steel-100 p-5 shadow-panel">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-industrial-blue">Machine Detail</p>
                        <h2 className="mt-2 font-display text-3xl font-semibold">{selectedMachine.machine.name}</h2>
                      </div>
                      <StatusPill status={selectedMachine.machine.status} />
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                      <div className="rounded-2xl bg-white/90 p-4">
                        <p className="text-steel-400">Wear Score</p>
                        <p className="mt-2 text-2xl font-semibold">{selectedMachine.latest.wearScore.toFixed(1)}</p>
                      </div>
                      <div className="rounded-2xl bg-white/90 p-4">
                        <p className="text-steel-400">Failure Risk</p>
                        <p className="mt-2 text-2xl font-semibold">{(selectedMachine.latest.failureRisk * 100).toFixed(0)}%</p>
                      </div>
                      <div className="rounded-2xl bg-white/90 p-4">
                        <p className="text-steel-400">Remaining Life</p>
                        <p className="mt-2 text-2xl font-semibold">{selectedMachine.latest.remainingLifeHours.toFixed(0)}h</p>
                      </div>
                      <div className="rounded-2xl bg-white/90 p-4">
                        <p className="text-steel-400">Next Hour Power</p>
                        <p className="mt-2 text-2xl font-semibold">{selectedMachine.latest.nextHourPower.toFixed(1)} kWh</p>
                      </div>
                    </div>
                    <div className="mt-6 rounded-3xl bg-steel-900 p-5 text-white">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-industrial-amber" />
                        <p className="font-display text-xl font-semibold">Maintenance Suggestion</p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-steel-100">{selectedMachine.maintenanceSuggestion}</p>
                      <div className="mt-5">
                        <p className="text-xs uppercase tracking-[0.22em] text-steel-300">Alerts Panel</p>
                        <div className="mt-3 grid gap-3">
                          {selectedMachine.alerts.map((alert) => (
                            <div key={alert.id} className="rounded-2xl bg-white/8 p-3">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-industrial-amber">
                                  {alert.severity}
                                </span>
                                <span className="text-xs text-steel-300">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="mt-2 text-sm text-steel-100">{alert.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
