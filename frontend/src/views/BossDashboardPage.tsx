import { AlertTriangle, BarChart3, BatteryCharging, BriefcaseBusiness, Drill, FileText } from "lucide-react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import { api } from "../services/api";
import { AuthActions } from "../ui/AuthActions";
import { ChatPanel } from "../ui/ChatPanel";
import { IndustrialBackground } from "../ui/IndustrialBackground";
import { MetricCard } from "../ui/MetricCard";
import { usePolling } from "../hooks/usePolling";

const pieColors = ["#2d5f8b", "#f1a42b", "#7b8ea1", "#ea580c"];

export function BossDashboardPage() {
  const { data, loading } = usePolling(api.getBossOverview, 12000);
  const { data: report } = usePolling(api.getDailyReportJson, 15000);
  const hasTelemetry = Boolean(data && (data.totalMachines > 0 || data.energyTrend.length > 0));

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 lg:px-10">
      <IndustrialBackground />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-industrial-blue">Executive Overview</p>
            <h1 className="mt-3 font-display text-5xl font-semibold">Operational exposure and business intelligence</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-steel-500">
              High-level visibility into energy demand, maintenance exposure, predicted failures, and daily production health.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 lg:items-end">
            <AuthActions />
            <a
              href="/api/reports/daily?format=pdf"
              className="inline-flex items-center gap-2 rounded-full bg-industrial-amber px-5 py-3 font-semibold text-steel-900 shadow-panel"
            >
              <FileText className="h-5 w-5" />
              Download daily PDF
            </a>
          </div>
        </div>

        {loading || !data ? (
          <div className="mt-10 rounded-[30px] bg-white/70 p-8 shadow-panel">Loading executive overview...</div>
        ) : !hasTelemetry ? (
          <div className="mt-10 rounded-[30px] border border-dashed border-steel-200 bg-white/75 p-10 shadow-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-industrial-blue">No executive data yet</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-steel-900">Upload telemetry before reviewing plant metrics.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-steel-500">
              The boss dashboard now stays empty until operator telemetry exists. After a CSV upload or successful InsForge hydration, the overview, fleet mix, energy trend, and report summary will reflect actual machine data.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard label="Total Machines" value={`${data.totalMachines}`} delta="Connected production assets" icon={Drill} />
              <MetricCard label="Risky Machines" value={`${data.riskyMachines}`} delta="Action queue monitored" icon={AlertTriangle} />
              <MetricCard label="Energy Usage" value={`${data.totalPower.toFixed(1)} kWh`} delta="Current rolling total" icon={BatteryCharging} />
              <MetricCard label="Avg Wear Score" value={`${data.averageWearScore.toFixed(1)}`} delta="Fleet degradation index" icon={BarChart3} />
              <MetricCard label="Predicted Failures" value={`${data.predictedFailures}`} delta="Next cycle exposure" icon={BriefcaseBusiness} />
              <MetricCard label="Daily Summary" value="Auto-generated" delta="Available for export" icon={FileText} />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-6">
                <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-panel backdrop-blur">
                  <div className="mb-4">
                    <h2 className="font-display text-2xl font-semibold">Energy Usage Trend</h2>
                    <p className="text-sm text-steel-500">Business-facing summary of production energy draw.</p>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.energyTrend}>
                        <defs>
                          <linearGradient id="boss-power" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2d5f8b" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#2d5f8b" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#c9d3dc" vertical={false} />
                        <XAxis dataKey="timestamp" hide />
                        <YAxis stroke="#7890a6" />
                        <Tooltip />
                        <Area type="monotone" dataKey="power" stroke="#2d5f8b" fill="url(#boss-power)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <ChatPanel role="boss" />
              </div>

              <div className="grid gap-6">
                <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-panel backdrop-blur">
                  <h2 className="font-display text-2xl font-semibold">Fleet Health Mix</h2>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.fleetHealth} dataKey="value" nameKey="label" innerRadius={62} outerRadius={94}>
                          {data.fleetHealth.map((entry, index) => (
                            <Cell key={entry.label} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white to-steel-100 p-5 shadow-panel">
                  <p className="text-sm uppercase tracking-[0.22em] text-industrial-blue">Daily Report Summary</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">End-of-day industry brief</h2>
                  <p className="mt-4 text-sm leading-7 text-steel-500">{report?.summary ?? data.dailySummary}</p>
                  {report && (
                    <div className="mt-6 grid gap-3 text-sm">
                      <div className="rounded-2xl bg-white/85 p-4">Machines monitored: {report.metrics.totalMachinesMonitored}</div>
                      <div className="rounded-2xl bg-white/85 p-4">Failure risks: {report.metrics.failureCount}</div>
                      <div className="rounded-2xl bg-white/85 p-4">Predicted failures next cycle: {report.metrics.predictedFailures}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
