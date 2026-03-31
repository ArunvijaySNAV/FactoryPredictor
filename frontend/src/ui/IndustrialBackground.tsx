import { motion } from "framer-motion";

export function IndustrialBackground({ compact = false }: { compact?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ x: compact ? [0, 120, 0] : [0, 220, 0] }}
        transition={{ duration: compact ? 10 : 14, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="absolute left-[-10%] top-24 h-2 w-48 rounded-full bg-industrial-amber/50 blur-sm"
      />
      <motion.div
        animate={{ x: compact ? [220, -80, 220] : [260, -150, 260] }}
        transition={{ duration: compact ? 9 : 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="absolute bottom-28 right-[-8%] h-2 w-64 rounded-full bg-industrial-blue/45 blur-sm"
      />
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 24, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="absolute right-10 top-16 h-40 w-40 rounded-full border border-industrial-blue/20"
      >
        <div className="absolute inset-6 rounded-full border border-industrial-amber/25" />
        <div className="absolute inset-[42%] rounded-full bg-industrial-blue/20" />
      </motion.div>
      <motion.div
        animate={{ opacity: [0.3, 0.8, 0.3], y: [-20, 30, -20] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-industrial-blue/60 to-transparent"
      />
      <motion.div
        animate={{ opacity: [0.1, 0.65, 0.1], x: [-30, 30, -30] }}
        transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="absolute left-0 top-1/3 h-px w-full bg-gradient-to-r from-transparent via-industrial-amber/70 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(90deg,rgba(45,95,139,0.06)_0,rgba(45,95,139,0.06)_1px,transparent_1px,transparent_52px)]" />
    </div>
  );
}
