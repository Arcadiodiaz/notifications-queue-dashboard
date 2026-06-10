"use client";

import type { NotificationRecord } from "../types/notificationRecord";
import type { NotificationStatus } from "../types/notificationJob";

type Props = {
  notifications: NotificationRecord[];
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
  onSend: (id: string) => void;
  onCancel: (id: string) => void;
};

const StatusPill = ({ status }: { status: NotificationStatus }) => {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold";
  if (status === "queued") return <span className={`${base} bg-amber-100 text-amber-800`}>Queued</span>;
  if (status === "sending") return <span className={`${base} bg-blue-100 text-blue-800`}>Sending...</span>;
  if (status === "sent") {
    return (
      <span className={`${base} bg-green-100 text-green-800`}>
        <span className="mr-1 inline-block size-2 rounded-full bg-green-600" />
        Sent
      </span>
    );
  }
  return (
    <span className={`${base} bg-red-100 text-red-800`}>
      <span className="mr-1 inline-block size-2 rounded-full bg-red-600" />
      Failed
    </span>
  );
};

export const NotificationList = ({ notifications, onDelete, onRetry, onSend, onCancel }: Props) => {
  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-10 text-center shadow-sm backdrop-blur">
        <div className="text-sm font-semibold text-neutral-900">No notifications yet</div>
        <div className="mt-1 text-sm text-neutral-600">Create your first job using the form above.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((n) => (
        <div
          key={n.job.id}
          className="flex flex-col gap-3 rounded-2xl border border-neutral-200/70 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md md:flex-row md:items-center md:justify-between"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="truncate text-sm font-semibold text-neutral-900">{n.job.title}</div>
              <StatusPill status={n.job.status} />
            </div>
            <div className="mt-1 text-xs text-neutral-500">{n.job.channel.toUpperCase()}</div>
            {n.job.status === "sending" ? (
              <div className="mt-2 h-2 w-full max-w-md overflow-hidden rounded bg-neutral-200">
                <div
                  className="h-full bg-blue-600 transition-[width]"
                  style={{ width: `${("progress" in n.job ? n.job.progress : 0) ?? 0}%` }}
                />
              </div>
            ) : null}
            {n.lastError ? (
              <div className="mt-2 truncate text-xs text-red-700">{n.lastError}</div>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {n.job.status === "queued" ? (
              <button
                type="button"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200"
                onClick={() => onSend(n.job.id)}
              >
                Send
              </button>
            ) : null}
            {n.job.status === "sending" ? (
              <button
                type="button"
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-neutral-200"
                onClick={() => onCancel(n.job.id)}
              >
                Cancel
              </button>
            ) : null}
            {n.job.status === "failed" ? (
              <button
                type="button"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200"
                onClick={() => onRetry(n.job.id)}
              >
                Retry
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-200"
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
