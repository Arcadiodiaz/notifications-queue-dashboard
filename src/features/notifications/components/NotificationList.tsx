"use client";

import type { NotificationRecord } from "../types/notificationRecord";

type Props = {
  notifications: NotificationRecord[];
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
};

const StatusPill = ({ status }: { status: NotificationRecord["status"] }) => {
  const base = "rounded px-2 py-0.5 text-xs font-medium";
  if (status === "pending") return <span className={`${base} bg-neutral-200 text-neutral-800`}>pending</span>;
  if (status === "sending") return <span className={`${base} bg-blue-100 text-blue-800`}>sending</span>;
  if (status === "sent") return <span className={`${base} bg-green-100 text-green-800`}>sent</span>;
  return <span className={`${base} bg-red-100 text-red-800`}>failed</span>;
};

export const NotificationList = ({ notifications, onDelete, onRetry }: Props) => {
  if (notifications.length === 0) {
    return <div className="text-sm text-neutral-600">No notifications yet.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.job.id}
          className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="truncate text-sm font-medium">{n.job.channel}</div>
              <StatusPill status={n.status} />
              <div className="text-xs text-neutral-600">attempts: {n.attempts}</div>
            </div>
            <div className="truncate text-xs text-neutral-600">{n.job.id}</div>
            {n.lastError ? (
              <div className="truncate text-xs text-red-700">{n.lastError}</div>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {n.status === "failed" ? (
              <button
                type="button"
                className="text-sm text-blue-700 hover:underline"
                onClick={() => onRetry(n.job.id)}
              >
                Retry
              </button>
            ) : null}
            <button
              type="button"
              className="text-sm text-red-600 hover:underline"
              onClick={() => onDelete(n.job.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
