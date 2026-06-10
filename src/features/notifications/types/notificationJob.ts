export type NotificationChannel = "email" | "sms" | "push";
export type NotificationStatus = "queued" | "sending" | "sent" | "failed";

export type NotificationJobBase = {
  id: string;
  title: string;
  channel: NotificationChannel;
};

export type QueuedNotificationJob = NotificationJobBase & {
  status: "queued";
};

export type SendingNotificationJob = NotificationJobBase & {
  status: "sending";
  progress: number;
};

export type SentNotificationJob = NotificationJobBase & {
  status: "sent";
};

export type FailedNotificationJob = NotificationJobBase & {
  status: "failed";
};

export type NotificationJob =
  | QueuedNotificationJob
  | SendingNotificationJob
  | SentNotificationJob
  | FailedNotificationJob;

export const assertNever = (value: never): never => {
  throw new Error(`Unhandled discriminated union member: ${String(value)}`);
};
