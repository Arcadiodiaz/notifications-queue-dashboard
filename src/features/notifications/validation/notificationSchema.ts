import * as Yup from "yup";
import type { NotificationFormValues } from "../types/notificationForm";

export const initialNotificationValues: NotificationFormValues = {
  title: "",
  channel: "email",
};

export const notificationSchema = Yup.object({
  title: Yup.string().trim().required("Title is required").defined(),

  channel: Yup.mixed<NotificationFormValues["channel"]>()
    .oneOf(["email", "sms", "push"])
    .required()
    .defined(),
}).required();
