"use client";

import { useCallback, useMemo, useState } from "react";
import type { NotificationJob } from "../types/notificationJob";

type UseNotificationsReturn = {
  notifications: NotificationJob[];
  removeNotification: (id: string) => void;
};

const seedNotifications: NotificationJob[] = [];

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<NotificationJob[]>(
    seedNotifications,
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return useMemo(
    () => ({
      notifications,
      removeNotification,
    }),
    [notifications, removeNotification],
  );
};
