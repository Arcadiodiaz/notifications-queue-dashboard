"use client";

import { useCallback, useMemo, useState } from "react";
import type { NotificationJob } from "../types/notificationJob";
import type { NotificationRecord, NotificationStatus } from "../types/notificationRecord";

type UseNotificationsReturn = {
  notifications: NotificationRecord[];
  addNotification: (job: NotificationJob) => void;
  removeNotification: (id: string) => void;
  updateNotification: (
    id: string,
    patch: Partial<Pick<NotificationRecord, "status" | "attempts" | "lastError">>,
  ) => void;
  setManyStatus: (ids: readonly string[], status: NotificationStatus) => void;
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
        status: "pending",
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
      patch: Partial<Pick<NotificationRecord, "status" | "attempts" | "lastError">>,
    ) => {
      setNotifications((prev) =>
        prev.map((n) => (n.job.id === id ? { ...n, ...patch } : n)),
      );
    },
    [],
  );

  const setManyStatus = useCallback((ids: readonly string[], status: NotificationStatus) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setNotifications((prev) =>
      prev.map((n) => (idSet.has(n.job.id) ? { ...n, status } : n)),
    );
  }, []);

  return useMemo(
    () => ({
      notifications,
      addNotification,
      removeNotification,
      updateNotification,
      setManyStatus,
    }),
    [notifications, addNotification, removeNotification, updateNotification, setManyStatus],
  );
};
