import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

export function SectionHeading({
  eyebrow,
  title,
  children
}: PropsWithChildren<{ eyebrow: string; title: string }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-2xl"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.32em] text-industrial-blue">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-semibold text-steel-900">{title}</h2>
      <p className="mt-4 text-base leading-7 text-steel-500">{children}</p>
    </motion.div>
  );
}

