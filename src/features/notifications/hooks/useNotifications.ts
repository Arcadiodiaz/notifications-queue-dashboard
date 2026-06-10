"use client";

import { useCallback, useMemo, useState } from "react";
import type { NotificationJob } from "../types/notificationJob";
import type { NotificationRecord } from "../types/notificationRecord";

type UseNotificationsReturn = {
  notifications: NotificationRecord[];
  addNotification: (job: NotificationJob) => void;
  removeNotification: (id: string) => void;
  updateNotification: (
    id: string,
    patch: Partial<{
      job: Partial<NotificationJob>;
      attempts: number;
      lastError?: string;
    }>,
  ) => void;
};

const seedNotifications: NotificationRecord[] = [];

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>(
    seedNotifications,
  );

  const addNotification = useCallback((job: NotificationJob) => {
    setNotifications((prev) => [
      {
        job,
        attempts: 0,
      },
      ...prev,
    ]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.job.id !== id));
  }, []);

  const updateNotification = useCallback(
    (
      id: string,
      patch: Partial<{
        job: Partial<NotificationJob>;
        attempts: number;
        lastError?: string;
      }>,
    ) => {
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.job.id !== id) return n;
          return {
            ...n,
            job: patch.job ? ({ ...n.job, ...patch.job } as NotificationJob) : n.job,
            attempts: typeof patch.attempts === "number" ? patch.attempts : n.attempts,
            lastError: patch.lastError,
          };
        }),
      );
    },
    [],
  );

  return useMemo(
    () => ({
      notifications,
      addNotification,
      removeNotification,
      updateNotification,
    }),
    [notifications, addNotification, removeNotification, updateNotification],
  );
};
