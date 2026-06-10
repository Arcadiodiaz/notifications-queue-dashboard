import * as Yup from "yup";
import type { NotificationFormValues } from "../types/notificationForm";

export const initialNotificationValues: NotificationFormValues = {
  channel: "email",
  to: "",
  subject: "",
  body: "",
  message: "",
  deviceToken: "",
  title: "",
};

export const notificationSchema = Yup.object({
  channel: Yup.mixed<NotificationFormValues["channel"]>()
    .oneOf(["email", "sms", "push"])
    .required()
    .defined(),

  to: Yup.string()
    .trim()
    .defined()
    .when("channel", {
      is: (c: NotificationFormValues["channel"]) => c === "email" || c === "sms",
      then: (s) => s.required("Recipient is required"),
      otherwise: (s) => s,
    }),

  subject: Yup.string()
    .trim()
    .defined()
    .when("channel", {
      is: "email",
      then: (s) => s.required("Subject is required"),
      otherwise: (s) => s,
    }),

  body: Yup.string()
    .trim()
    .defined()
    .when("channel", {
      is: (c: NotificationFormValues["channel"]) => c === "email" || c === "push",
      then: (s) => s.required("Body is required"),
      otherwise: (s) => s,
    }),

  message: Yup.string()
    .trim()
    .defined()
    .when("channel", {
      is: "sms",
      then: (s) => s.required("Message is required"),
      otherwise: (s) => s,
    }),

  deviceToken: Yup.string()
    .trim()
    .defined()
    .when("channel", {
      is: "push",
      then: (s) => s.required("Device token is required"),
      otherwise: (s) => s,
    }),

  title: Yup.string()
    .trim()
    .defined()
    .when("channel", {
      is: "push",
      then: (s) => s.required("Title is required"),
      otherwise: (s) => s,
    }),
}).required();
