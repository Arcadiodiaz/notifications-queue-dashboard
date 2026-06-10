"use client";

import { Form, Formik } from "formik";
import type React from "react";
import { initialNotificationValues, notificationSchema } from "../validation/notificationSchema";
import type { NotificationFormValues } from "../types/notificationForm";
import type { NotificationJob } from "../types/notificationJob";

type Props = {
  onCreate: (job: NotificationJob) => void;
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      {...props}
      className={
        "w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 " +
        (props.className ?? "")
      }
    />
  );
};

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 " +
        (props.className ?? "")
      }
    />
  );
};

const FieldError = ({ error }: { error?: string }) => {
  if (!error) return null;
  return <div className="text-xs text-red-600">{error}</div>;
};

const toJob = (values: NotificationFormValues): NotificationJob => {
  const base = {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    createdAt: Date.now(),
  };

  if (values.channel === "email") {
    return {
      ...base,
      channel: "email",
      to: values.to.trim(),
      subject: values.subject.trim(),
      body: values.body.trim(),
    };
  }

  if (values.channel === "sms") {
    return {
      ...base,
      channel: "sms",
      to: values.to.trim(),
      message: values.message.trim(),
    };
  }

  return {
    ...base,
    channel: "push",
    deviceToken: values.deviceToken.trim(),
    title: values.title.trim(),
    body: values.body.trim(),
  };
};

export const NotificationForm = ({ onCreate }: Props) => {
  return (
    <Formik
      initialValues={initialNotificationValues}
      validationSchema={notificationSchema}
      onSubmit={(values, helpers) => {
        onCreate(toJob(values));
        helpers.resetForm();
      }}
    >
      {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
        <Form className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Channel</span>
              <select
                name="channel"
                value={values.channel}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
              </select>
              <FieldError error={touched.channel ? (errors.channel as string | undefined) : undefined} />
            </label>

            {(values.channel === "email" || values.channel === "sms") && (
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-sm font-medium">To</span>
                <Input name="to" value={values.to} onChange={handleChange} onBlur={handleBlur} />
                <FieldError error={touched.to ? errors.to : undefined} />
              </label>
            )}

            {values.channel === "push" && (
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-sm font-medium">Device Token</span>
                <Input
                  name="deviceToken"
                  value={values.deviceToken}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <FieldError error={touched.deviceToken ? errors.deviceToken : undefined} />
              </label>
            )}
          </div>

          {values.channel === "email" && (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Subject</span>
              <Input
                name="subject"
                value={values.subject}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FieldError error={touched.subject ? errors.subject : undefined} />
            </label>
          )}

          {values.channel === "sms" && (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Message</span>
              <TextArea
                rows={3}
                name="message"
                value={values.message}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FieldError error={touched.message ? errors.message : undefined} />
            </label>
          )}

          {values.channel === "push" && (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Title</span>
              <Input name="title" value={values.title} onChange={handleChange} onBlur={handleBlur} />
              <FieldError error={touched.title ? errors.title : undefined} />
            </label>
          )}

          {(values.channel === "email" || values.channel === "push") && (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Body</span>
              <TextArea
                rows={4}
                name="body"
                value={values.body}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FieldError error={touched.body ? errors.body : undefined} />
            </label>
          )}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Add Notification
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
