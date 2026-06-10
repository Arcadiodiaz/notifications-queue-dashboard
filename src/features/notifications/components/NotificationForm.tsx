"use client";

import { Form, Formik } from "formik";
import type React from "react";
import { initialNotificationValues, notificationSchema } from "../validation/notificationSchema";
import type { NotificationFormValues } from "../types/notificationForm";
import type { NotificationJob } from "../types/notificationJob";

type Props = {
  onCreate: (job: NotificationJob) => boolean;
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      {...props}
      className={
        "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 " +
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
  return {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    title: values.title.trim(),
    channel: values.channel,
    status: "queued",
  };
};

export const NotificationForm = ({ onCreate }: Props) => {
  return (
    <Formik
      initialValues={initialNotificationValues}
      validationSchema={notificationSchema}
      onSubmit={(values, helpers) => {
        const accepted = onCreate(toJob(values));
        if (accepted) {
          helpers.resetForm();
        } else {
          helpers.setSubmitting(false);
        }
      }}
    >
      {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
        <Form className="flex flex-col gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Title</div>
            <div className="mt-2">
              <Input
                name="title"
                placeholder="Enter the title..."
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            <div className="mt-1">
              <FieldError error={touched.title ? errors.title : undefined} />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Channel</div>
            <div className="mt-2">
              <select
                name="channel"
                value={values.channel}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
              </select>
            </div>
            <div className="mt-1">
              <FieldError error={touched.channel ? (errors.channel as string | undefined) : undefined} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50"
          >
            Add Notification
          </button>
        </Form>
      )}
    </Formik>
  );
};
