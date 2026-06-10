import type { NotificationChannel } from "./notificationJob";

export type NotificationFormValues = {
  channel: NotificationChannel;
  to: string;
  subject: string;
  body: string;
  message: string;
  deviceToken: string;
  title: string;
};
