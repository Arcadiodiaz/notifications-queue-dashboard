"use client";

import { Mail, MessageSquareText, Send, Trash2, Undo2, X, Bell } from "lucide-react";
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

const ChannelIcon = ({ channel }: { channel: NotificationRecord["job"]["channel"] }) => {
  if (channel === "email") return <Mail className="size-4" />;
  if (channel === "sms") return <MessageSquareText className="size-4" />;
  return <Bell className="size-4" />;
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
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
      <div className="hidden grid-cols-12 gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-600 md:grid">
        <div className="col-span-5">Job</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Progress</div>
        <div className="col-span-3 text-right">Actions</div>
      </div>

      <div className="divide-y divide-neutral-200">
        {notifications.map((n) => {
          const pct = ("progress" in n.job ? n.job.progress : 0) ?? 0;
          const progressLabel = n.job.status === "sending" ? `${pct}%` : n.job.status === "sent" ? "100%" : "—";

          return (
            <div key={n.job.id}>
              <div className="flex flex-col gap-3 px-4 py-4 md:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 inline-flex size-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">
                      <ChannelIcon channel={n.job.channel} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-neutral-900">{n.job.title}</div>
                      <div className="mt-0.5 text-xs text-neutral-500">{n.job.channel.toUpperCase()}</div>
                    </div>
                  </div>
                  <StatusPill status={n.job.status} />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3 text-xs text-neutral-600">
                    <div className="font-medium">Progress</div>
                    <div className="font-medium">{progressLabel}</div>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-[width]"
                      style={{ width: n.job.status === "sending" ? `${pct}%` : n.job.status === "sent" ? "100%" : "0%" }}
                    />
                  </div>
                </div>

                {n.lastError ? <div className="truncate text-xs text-red-700">{n.lastError}</div> : null}

                <div className="flex flex-wrap items-center justify-end gap-2">
                  {n.job.status === "queued" ? (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200"
                      onClick={() => onSend(n.job.id)}
                    >
                      <Send className="size-4" />
                      Send
                    </button>
                  ) : null}
                  {n.job.status === "sending" ? (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-neutral-200"
                      onClick={() => onCancel(n.job.id)}
                    >
                      <X className="size-4" />
                      Cancel
                    </button>
                  ) : null}
                  {n.job.status === "failed" ? (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200"
                      onClick={() => onRetry(n.job.id)}
                    >
                      <Undo2 className="size-4" />
                      Retry
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-200"
                    onClick={() => onDelete(n.job.id)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="hidden grid-cols-12 gap-3 px-4 py-3 md:grid">
                <div className="col-span-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 inline-flex size-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                      <ChannelIcon channel={n.job.channel} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-neutral-900">{n.job.title}</div>
                      <div className="mt-0.5 text-xs text-neutral-500">{n.job.channel.toUpperCase()}</div>
                      {n.lastError ? <div className="mt-1 truncate text-xs text-red-700">{n.lastError}</div> : null}
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <StatusPill status={n.job.status} />
                </div>

                <div className="col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-[width]"
                        style={{
                          width: n.job.status === "sending" ? `${pct}%` : n.job.status === "sent" ? "100%" : "0%",
                        }}
                      />
                    </div>
                    <div className="w-10 text-right text-xs font-medium text-neutral-600">{progressLabel}</div>
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="flex flex-wrap items-center justify-end gap-2 md:flex-nowrap">
                    {n.job.status === "queued" ? (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200"
                        onClick={() => onSend(n.job.id)}
                      >
                        <Send className="size-4" />
                        Send
                      </button>
                    ) : null}
                    {n.job.status === "sending" ? (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-neutral-200"
                        onClick={() => onCancel(n.job.id)}
                      >
                        <X className="size-4" />
                        Cancel
                      </button>
                    ) : null}
                    {n.job.status === "failed" ? (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200"
                        onClick={() => onRetry(n.job.id)}
                      >
                        <Undo2 className="size-4" />
                        Retry
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-200"
                      onClick={() => onDelete(n.job.id)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
