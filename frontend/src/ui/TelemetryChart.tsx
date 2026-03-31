import type { TelemetryRecord } from "@machine-health/shared";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function TelemetryChart({
  data,
  dataKey,
  title,
  color
}: {
  data: TelemetryRecord[];
  dataKey: keyof Pick<TelemetryRecord, "temperature" | "vibration" | "power" | "rpm">;
  title: string;
  color: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-panel backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-2xl font-semibold text-steel-900">{title}</h3>
        <div className="h-3 w-10 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`fill-${String(dataKey)}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.45} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#c9d3dc" vertical={false} />
            <XAxis dataKey="timestamp" hide />
            <YAxis stroke="#7890a6" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fillOpacity={1}
              fill={`url(#fill-${String(dataKey)})`}
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
