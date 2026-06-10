export type NotificationChannel = "email" | "sms" | "push";

export type NotificationJobBase = {
  id: string;
  createdAt: number;
};

export type EmailNotificationJob = NotificationJobBase & {
  channel: "email";
  to: string;
  subject: string;
  body: string;
};

export type SmsNotificationJob = NotificationJobBase & {
  channel: "sms";
  to: string;
  message: string;
};

export type PushNotificationJob = NotificationJobBase & {
  channel: "push";
  deviceToken: string;
  title: string;
  body: string;
};

export type NotificationJob =
  | EmailNotificationJob
  | SmsNotificationJob
  | PushNotificationJob;

export type NotificationJobChannel = NotificationJob["channel"];

export const assertNever = (value: never): never => {
  throw new Error(`Unhandled discriminated union member: ${String(value)}`);
};
