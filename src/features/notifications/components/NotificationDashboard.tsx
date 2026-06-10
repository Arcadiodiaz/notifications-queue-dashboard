"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Plus,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { useNotifications } from "../hooks/useNotifications";
import { useNotificationQueue } from "../hooks/useNotificationQueue";
import type { NotificationChannel, NotificationStatus } from "../types/notificationJob";
import { NotificationForm } from "./NotificationForm";
import { NotificationList } from "./NotificationList";
import { NotificationProgress } from "./NotificationProgress";

export const NotificationDashboard = () => {
  const { notifications, addNotification, removeNotification, updateNotification } = useNotifications();
  const { state, sendAll, sendOne, cancelOne, cancelAll } = useNotificationQueue();

  const [createError, setCreateError] = useState<string | null>(null);
  const [sendAllError, setSendAllError] = useState<string | null>(null);

  const [channelFilter, setChannelFilter] = useState<"all" | NotificationChannel>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | NotificationStatus>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const MAX_ATTEMPTS = 3;
  const CONCURRENCY = 3;

  const stats = useMemo(() => {
    const queued = notifications.filter((n) => n.job.status === "queued").length;
    const sending = notifications.filter((n) => n.job.status === "sending").length;
    const sent = notifications.filter((n) => n.job.status === "sent").length;
    const failed = notifications.filter((n) => n.job.status === "failed").length;

    return {
      total: notifications.length,
      queued,
      sending,
      sent,
      failed,
    };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const channelOk = channelFilter === "all" ? true : n.job.channel === channelFilter;
      const statusOk = statusFilter === "all" ? true : n.job.status === statusFilter;
      const query = searchQuery.trim().toLowerCase();
      const queryOk = query.length === 0 ? true : n.job.title.trim().toLowerCase().includes(query);
      return channelOk && statusOk && queryOk;
    });
  }, [notifications, channelFilter, statusFilter, searchQuery]);

  const onCreate = (job: Parameters<typeof addNotification>[0]) => {
    setCreateError(null);
    setSendAllError(null);

    const normalizedTitle = job.title.trim().toLowerCase();
    const isDuplicate = notifications.some(
      (n) => n.job.title.trim().toLowerCase() === normalizedTitle && n.job.channel === job.channel,
    );

    if (isDuplicate) {
      setCreateError("Title must be unique per channel");
      return false;
    }

    const queuedCount = notifications.filter((n) => n.job.status === "queued").length;
    if (queuedCount >= 5) {
      setCreateError("Maximum 5 queued notifications");
      return false;
    }

    addNotification(job);
    return true;
  };

  const onSendAll = async () => {
    setSendAllError(null);

    if (notifications.length === 0) {
      setSendAllError(
        JSON.stringify({ title: "Notification error", notifications: ["Minimum 1 notification"] }, null, 2),
      );
      return;
    }

    const hasSending = notifications.some((n) => n.job.status === "sending");
    if (hasSending) {
      setSendAllError(
        JSON.stringify({ title: "Notification error", notifications: ["There are notifications sending"] }, null, 2),
      );
      return;
    }

    await sendAll(notifications, {
      concurrency: CONCURRENCY,
      maxAttempts: MAX_ATTEMPTS,
      onUpdate: updateNotification,
    });
  };

  const onDelete = async (id: string) => {
    const record = notifications.find((n) => n.job.id === id);
    const title = record?.job.title ?? "this notification";

    const result = await Swal.fire({
      title: "Delete notification?",
      text: `You are about to delete \"${title}\". This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;
    removeNotification(id);
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="flex flex-col gap-4 rounded-3xl border border-neutral-200/70 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Queue Dashboard</div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Notifications</h1>
            <p className="text-sm text-neutral-600">
              Create jobs, send with concurrency, track progress, cancel in-flight sends, and retry on failures.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-neutral-200 disabled:opacity-50"
              disabled={state.status === "running" || notifications.length === 0}
              onClick={onSendAll}
            >
              <Send className="size-4" />
              Send All
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-neutral-200 disabled:opacity-50"
              disabled={notifications.every((n) => n.job.status !== "sending")}
              onClick={cancelAll}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200"
              onClick={() => {
                const el = document.getElementById("create-notification");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <Plus className="size-4" />
              New Notification
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="inline-flex size-10 items-center justify-center rounded-xl bg-neutral-200/60 text-neutral-700">
                <BarChart3 className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-neutral-600">Total</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">{stats.total}</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="inline-flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <Clock3 className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-amber-800">Queued</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-amber-900">{stats.queued}</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="inline-flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                <Send className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-blue-800">Sending</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-blue-900">{stats.sending}</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-green-200 bg-green-50/80 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="inline-flex size-10 items-center justify-center rounded-xl bg-green-100 text-green-800">
                <CheckCircle2 className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-green-800">Sent</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-green-900">{stats.sent}</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="inline-flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-800">
                <XCircle className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-red-800">Failed</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-red-900">{stats.failed}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div id="create-notification" className="flex lg:col-span-4 xl:col-span-3">
          <div className="flex h-full w-full flex-col rounded-3xl border border-neutral-200/70 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="mb-1 text-sm font-semibold text-neutral-900">Create Notification</div>
            <div className="mb-4 text-sm text-neutral-600">Add a new job to the queue.</div>
            <NotificationForm onCreate={onCreate} />
            {createError ? (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{createError}</div>
            ) : null}
            <div className="flex-1" />
          </div>
        </div>

        <div className="flex lg:col-span-8 xl:col-span-9">
          <div className="flex h-full w-full flex-col rounded-3xl border border-neutral-200/70 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4">
              <div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">Queue</div>
                  <div className="mt-1 text-sm text-neutral-600">
                    Send in bulk, track progress, and manage per-item actions.
                  </div>
                </div>
              </div>

              {sendAllError ? (
                <pre className="overflow-auto rounded-md bg-neutral-100 p-3 text-xs text-neutral-800">{sendAllError}</pre>
              ) : null}

              <NotificationProgress
                status={state.status}
                completed={state.status === "running" ? state.completed : state.status === "idle" ? 0 : state.completed}
                total={state.status === "running" ? state.total : state.status === "idle" ? notifications.length : state.total}
              />

              <div className="grid w-full grid-cols-1 gap-3 pt-2 lg:grid-cols-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-neutral-700">Channel</span>
                  <select
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value as "all" | NotificationChannel)}
                  >
                    <option value="all">All</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-neutral-700">Status</span>
                  <select
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "all" | NotificationStatus)}
                  >
                    <option value="all">All</option>
                    <option value="queued">Queued</option>
                    <option value="sending">Sending</option>
                    <option value="sent">Sent</option>
                    <option value="failed">Failed</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-neutral-700">Search</span>
                  <div className="relative">
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title..."
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-3 text-sm text-neutral-900 shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                  </div>
                </label>
              </div>

              <div className="flex-1 pt-2">
                <NotificationList
                  notifications={filteredNotifications}
                  onDelete={onDelete}
                  onRetry={(id) => updateNotification(id, { job: { status: "queued" }, lastError: undefined })}
                  onSend={(id) => {
                    const record = notifications.find((n) => n.job.id === id);
                    if (!record) return;
                    void sendOne(record, {
                      maxAttempts: MAX_ATTEMPTS,
                      onUpdate: updateNotification,
                    });
                  }}
                  onCancel={(id) => cancelOne(id)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
