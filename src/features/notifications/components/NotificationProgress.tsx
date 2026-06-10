"use client";

type Props = {
  completed: number;
  total: number;
  status: "idle" | "running" | "done" | "aborted";
};

export const NotificationProgress = ({ completed, total, status }: Props) => {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  const statusLabel = status === "idle" ? "Idle" : status === "running" ? "Running" : status === "done" ? "Done" : "Aborted";
  const statusClass =
    status === "running"
      ? "bg-blue-100 text-blue-800"
      : status === "done"
        ? "bg-green-100 text-green-800"
        : status === "aborted"
          ? "bg-red-100 text-red-800"
          : "bg-neutral-100 text-neutral-700";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-neutral-900">Progress</div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`inline-flex items-center rounded px-2 py-0.5 font-semibold ${statusClass}`}>{statusLabel}</span>
          <span className="text-neutral-600">
            {completed}/{total}
          </span>
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full rounded-full bg-blue-600 transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
