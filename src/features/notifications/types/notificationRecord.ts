import type { NotificationJob } from "./notificationJob";

export type NotificationStatus = "pending" | "sending" | "sent" | "failed";

export type NotificationRecord = {
  job: NotificationJob;
  status: NotificationStatus;
  attempts: number;
  lastError?: string;
};
