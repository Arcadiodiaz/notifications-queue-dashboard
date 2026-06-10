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
        "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 " +
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
        <Form className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="w-12 text-sm font-medium text-neutral-700">Title:</div>
              <div className="flex-1">
                <Input
                  name="title"
                  placeholder="Enter the title..."
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
            </div>
            <div className="pl-[60px]">
              <FieldError error={touched.title ? errors.title : undefined} />
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="w-12 text-sm font-medium text-neutral-700">Canal:</div>
              <div className="flex-1">
                <select
                  name="channel"
                  value={values.channel}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push</option>
                </select>
              </div>
            </div>
            <div className="pl-[60px]">
              <FieldError error={touched.channel ? (errors.channel as string | undefined) : undefined} />
            </div>
          </div>

          <div className="lg:col-span-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Add Notification
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
