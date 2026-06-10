"use client";

import { useMemo, useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { useNotificationQueue } from "../hooks/useNotificationQueue";
import type { NotificationChannel } from "../types/notificationJob";
import type { NotificationStatus } from "../types/notificationRecord";
import { NotificationForm } from "./NotificationForm";
import { NotificationList } from "./NotificationList";
import { NotificationProgress } from "./NotificationProgress";

export const NotificationDashboard = () => {
  const { notifications, addNotification, removeNotification, updateNotification } = useNotifications();
  const { state, sendAll, abort } = useNotificationQueue();

  const [channelFilter, setChannelFilter] = useState<"all" | NotificationChannel>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | NotificationStatus>("all");

  const MAX_ATTEMPTS = 3;
  const CONCURRENCY = 3;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const channelOk = channelFilter === "all" ? true : n.job.channel === channelFilter;
      const statusOk = statusFilter === "all" ? true : n.status === statusFilter;
      return channelOk && statusOk;
    });
  }, [notifications, channelFilter, statusFilter]);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-neutral-600">
          Manage a queue of notification jobs and simulate sending with progress.
        </p>
      </header>

      <div className="rounded-lg border p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium">Delivery</div>
            <div className="text-xs text-neutral-600">
              Run the queue with concurrency and abort support.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              disabled={state.status === "running" || notifications.length === 0}
              onClick={() =>
                sendAll(notifications, {
                  concurrency: CONCURRENCY,
                  maxAttempts: MAX_ATTEMPTS,
                  onUpdate: updateNotification,
                })
              }
            >
              Send All
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
              disabled={state.status !== "running"}
              onClick={abort}
            >
              Abort
            </button>
          </div>
        </div>

        <div className="mt-4">
          <NotificationProgress
            status={state.status}
            completed={state.status === "running" ? state.completed : state.status === "idle" ? 0 : state.completed}
            total={state.status === "running" ? state.total : state.status === "idle" ? notifications.length : state.total}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium">Create</div>
        <div className="mt-3">
          <NotificationForm onCreate={addNotification} />
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium">Queue</div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-700">Filter by channel</span>
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
            <span className="text-xs font-medium text-neutral-700">Filter by status</span>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | NotificationStatus)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </label>
        </div>
        <div className="mt-3">
          <NotificationList
            notifications={filteredNotifications}
            onDelete={removeNotification}
            onRetry={(id) => updateNotification(id, { status: "pending", lastError: undefined })}
          />
        </div>
      </div>
    </section>
  );
};
