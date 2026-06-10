"use client";

import { useMemo, useState } from "react";
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

  const MAX_ATTEMPTS = 3;
  const CONCURRENCY = 3;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const channelOk = channelFilter === "all" ? true : n.job.channel === channelFilter;
      const statusOk = statusFilter === "all" ? true : n.job.status === statusFilter;
      return channelOk && statusOk;
    });
  }, [notifications, channelFilter, statusFilter]);

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
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Notifications</h1>
      </header>

      <div className="rounded-lg border bg-white p-4">
        <NotificationForm onCreate={onCreate} />
        {createError ? (
          <div className="mt-2 text-sm text-red-700">{createError}</div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-white p-4">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={state.status === "running" || notifications.length === 0}
            onClick={onSendAll}
          >
            Send All
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-neutral-100 px-5 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-200 disabled:opacity-50"
            disabled={notifications.every((n) => n.job.status !== "sending")}
            onClick={cancelAll}
          >
            Cancel
          </button>
        </div>

        {sendAllError ? (
          <pre className="overflow-auto rounded-md bg-neutral-100 p-3 text-xs text-neutral-800">{sendAllError}</pre>
        ) : null}

        <NotificationProgress
          status={state.status}
          completed={state.status === "running" ? state.completed : state.status === "idle" ? 0 : state.completed}
          total={state.status === "running" ? state.total : state.status === "idle" ? notifications.length : state.total}
        />
      </div>

      <div className="rounded-lg border bg-white p-4">
        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-700">Channel</span>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
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
              className="w-full rounded-md border px-3 py-2 text-sm"
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
        </div>

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
    </section>
  );
};
