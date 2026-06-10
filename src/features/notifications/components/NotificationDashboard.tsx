"use client";

import { useNotifications } from "../hooks/useNotifications";

export const NotificationDashboard = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-neutral-600">
          Manage a queue of notification jobs and simulate sending with progress.
        </p>
      </header>

      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium">Queue</div>
        <div className="mt-3 flex flex-col gap-2">
          {notifications.length === 0 ? (
            <div className="text-sm text-neutral-600">No notifications yet.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{n.channel}</div>
                  <div className="truncate text-xs text-neutral-600">{n.id}</div>
                </div>
                <button
                  type="button"
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => removeNotification(n.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
