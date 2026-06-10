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
    return <div className="text-sm text-neutral-600">No notifications yet.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.job.id}
          className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-4 py-3"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="truncate text-sm font-semibold text-neutral-900">{n.job.title}</div>
              <StatusPill status={n.job.status} />
            </div>
            <div className="mt-0.5 text-xs text-neutral-500">{n.job.channel.toUpperCase()}</div>
            {n.job.status === "sending" ? (
              <div className="mt-2 h-2 w-64 max-w-full overflow-hidden rounded bg-neutral-200">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${("progress" in n.job ? n.job.progress : 0) ?? 0}%` }}
                />
              </div>
            ) : null}
            {n.lastError ? (
              <div className="truncate text-xs text-red-700">{n.lastError}</div>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {n.job.status === "queued" ? (
              <button
                type="button"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                onClick={() => onSend(n.job.id)}
              >
                Send
              </button>
            ) : null}
            {n.job.status === "sending" ? (
              <button
                type="button"
                className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm hover:bg-neutral-200"
                onClick={() => onCancel(n.job.id)}
              >
                Cancel
              </button>
            ) : null}
            {n.job.status === "failed" ? (
              <button
                type="button"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                onClick={() => onRetry(n.job.id)}
              >
                Retry
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
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
