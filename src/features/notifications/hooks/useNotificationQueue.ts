"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { NotificationRecord } from "../types/notificationRecord";
import { runQueue } from "@/lib/queue/runQueue";

type SendState =
  | { status: "idle" }
  | {
      status: "running";
      startedAt: number;
      completed: number;
      total: number;
      running: number;
      pending: number;
    }
  | { status: "aborted"; completed: number; total: number }
  | { status: "done"; completed: number; total: number };

type UseNotificationQueueReturn = {
  state: SendState;
  sendOne: (
    record: NotificationRecord,
    options: {
      maxAttempts: number;
      onUpdate: (
        id: string,
        patch: Partial<{
          job: Partial<NotificationRecord["job"]>;
          attempts: number;
          lastError?: string;
        }>,
      ) => void;
    },
  ) => Promise<void>;
  sendAll: (
    items: readonly NotificationRecord[],
    options: {
      concurrency: number;
      maxAttempts: number;
      onUpdate: (
        id: string,
        patch: Partial<{
          job: Partial<NotificationRecord["job"]>;
          attempts: number;
          lastError?: string;
        }>,
      ) => void;
    },
  ) => Promise<void>;
  cancelOne: (id: string) => void;
  cancelAll: () => void;
};

const sleep = (ms: number, signal?: AbortSignal) => {
  return new Promise<void>((resolve, reject) => {
    const id = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    };

    if (signal) {
      if (signal.aborted) return onAbort();
      signal.addEventListener("abort", onAbort);
    }
  });
};

export const useNotificationQueue = (): UseNotificationQueueReturn => {
  const startedAtRef = useRef<number | null>(null);
  const latestRunningCompletedRef = useRef<number>(0);
  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const [state, setState] = useState<SendState>({ status: "idle" });

  const cancelOne = useCallback((id: string) => {
    const controller = controllersRef.current.get(id);
    controller?.abort();
  }, []);

  const cancelAll = useCallback(() => {
    controllersRef.current.forEach((controller) => {
      controller.abort();
    });
  }, []);

  const sendOne = useCallback(
    async (
      record: NotificationRecord,
      options: {
        maxAttempts: number;
        onUpdate: (
          id: string,
          patch: Partial<{
            job: Partial<NotificationRecord["job"]>;
            attempts: number;
            lastError?: string;
          }>,
        ) => void;
      },
    ) => {
      if (record.attempts >= options.maxAttempts) return;
      if (record.job.status === "sending") return;

      const controller = new AbortController();
      controllersRef.current.set(record.job.id, controller);

      options.onUpdate(record.job.id, {
        job: { status: "sending", progress: 0 },
        attempts: record.attempts + 1,
        lastError: undefined,
      });

      const totalMs = 1000 + Math.floor(Math.random() * 7000);
      const startedAt = Date.now();

      try {
        while (true) {
          const elapsed = Date.now() - startedAt;
          const pct = Math.min(100, Math.round((elapsed / totalMs) * 100));
          options.onUpdate(record.job.id, {
            job: { status: "sending", progress: pct },
          });

          if (elapsed >= totalMs) break;
          await sleep(120, controller.signal);
        }

        const fail = Math.random() < 0.2;
        if (fail) {
          options.onUpdate(record.job.id, {
            job: { status: "failed" },
            lastError: "Simulated send failure",
          });
          return;
        }

        options.onUpdate(record.job.id, { job: { status: "sent" } });
      } catch (e) {
        if (controller.signal.aborted) {
          options.onUpdate(record.job.id, { job: { status: "queued" } });
          return;
        }
        options.onUpdate(record.job.id, {
          job: { status: "failed" },
          lastError: e instanceof Error ? e.message : "Unknown error",
        });
      } finally {
        controllersRef.current.delete(record.job.id);
      }
    },
    [],
  );

  const sendAll = useCallback(
    async (
      items: readonly NotificationRecord[],
      options: {
        concurrency: number;
        maxAttempts: number;
        onUpdate: (
          id: string,
          patch: Partial<{
            job: Partial<NotificationRecord["job"]>;
            attempts: number;
            lastError?: string;
          }>,
        ) => void;
      },
    ) => {
      const eligible = items.filter(
        (n) =>
          (n.job.status === "queued" || n.job.status === "failed") &&
          n.attempts < options.maxAttempts,
      );

      if (eligible.length === 0) return;
      startedAtRef.current = Date.now();
      latestRunningCompletedRef.current = 0;

      setState({
        status: "running",
        startedAt: startedAtRef.current,
        completed: 0,
        total: eligible.length,
        running: 0,
        pending: eligible.length,
      });

      try {
        const jobs = eligible.map((record) => async () => {
          await sendOne(record, {
            maxAttempts: options.maxAttempts,
            onUpdate: options.onUpdate,
          });
          return record.job.id;
        });

        await runQueue(options.concurrency, jobs);

        setState({ status: "done", completed: eligible.length, total: eligible.length });
      } catch (e) {
        if (e instanceof Error) {
          // No-op.
        }
        throw e;
      } finally {
        startedAtRef.current = null;
      }
    },
    [sendOne],
  );

  return useMemo(
    () => ({
      state,
      sendOne,
      sendAll,
      cancelOne,
      cancelAll,
    }),
    [state, sendOne, sendAll, cancelOne, cancelAll],
  );
};
