"use client";

type Props = {
  completed: number;
  total: number;
  status: "idle" | "running" | "done" | "aborted";
};

export const NotificationProgress = ({ completed, total, status }: Props) => {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <div className="font-medium">Progress</div>
        <div className="text-neutral-600">
          {status} · {completed}/{total}
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded bg-neutral-200">
        <div className="h-full bg-black" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
