import type { NotificationJob } from "./notificationJob";

export type NotificationRecord = {
  job: NotificationJob;
  attempts: number;
  lastError?: string;
};
