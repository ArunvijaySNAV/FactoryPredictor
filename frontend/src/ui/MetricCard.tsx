import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  delta,
  icon: Icon
}: {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-panel backdrop-blur"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-steel-400">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold text-steel-900">{value}</p>
        </div>
        <div className="rounded-2xl bg-industrial-blue/10 p-3 text-industrial-blue">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="mt-4 text-sm text-industrial-amber">{delta}</p>
    </motion.div>
  );
}

