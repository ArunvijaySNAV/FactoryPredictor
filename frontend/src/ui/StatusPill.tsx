import clsx from "clsx";

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
        status === "healthy" && "bg-emerald-100 text-emerald-700",
        status === "warning" && "bg-amber-100 text-amber-700",
        status === "critical" && "bg-rose-100 text-rose-700",
        status === "maintenance" && "bg-sky-100 text-sky-700"
      )}
    >
      {status}
    </span>
  );
}

