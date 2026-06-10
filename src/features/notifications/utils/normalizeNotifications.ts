import type { NotificationChannel, NotificationJob } from "../types/notificationJob";

type NotificationJobLike = {
  title: string;
  channel: NotificationChannel;
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isNotificationJob = (value: unknown): value is NotificationJob => {
  if (!isObject(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    (value.channel === "email" || value.channel === "sms" || value.channel === "push") &&
    (value.status === "queued" ||
      value.status === "sending" ||
      value.status === "sent" ||
      value.status === "failed")
  );
};

const isJobLike = (value: unknown): value is NotificationJobLike => {
  if (!isObject(value)) return false;
  return (
    typeof value.title === "string" &&
    (value.channel === "email" || value.channel === "sms" || value.channel === "push")
  );
};

const createId = (): string => {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const normalizeNotifications = <T>(items: T[]): NotificationJob[] => {
  const seen = new Set<string>();
  const out: NotificationJob[] = [];

  for (const item of items) {
    let title: string;
    let channel: NotificationChannel;

    if (isNotificationJob(item)) {
      title = item.title;
      channel = item.channel;
    } else if (isJobLike(item)) {
      title = item.title;
      channel = item.channel;
    } else {
      throw new Error("normalizeNotifications: unsupported input item");
    }

    const key = `${title.toLowerCase()}::${channel}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      id: createId(),
      title,
      channel,
      status: "queued",
    });
  }

  return out;
};
