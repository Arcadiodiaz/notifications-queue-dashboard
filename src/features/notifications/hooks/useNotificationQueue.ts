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
  sendAll: (
    items: readonly NotificationRecord[],
    options: {
      concurrency: number;
      maxAttempts: number;
      onUpdate: (id: string, patch: Partial<Pick<NotificationRecord, "status" | "attempts" | "lastError">>) => void;
    },
  ) => Promise<void>;
  abort: () => void;
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const latestRunningCompletedRef = useRef<number>(0);
  const [state, setState] = useState<SendState>({ status: "idle" });

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const sendAll = useCallback(
    async (
      items: readonly NotificationRecord[],
      options: {
        concurrency: number;
        maxAttempts: number;
        onUpdate: (id: string, patch: Partial<Pick<NotificationRecord, "status" | "attempts" | "lastError">>) => void;
      },
    ) => {
      const eligible = items.filter(
        (n) =>
          (n.status === "pending" || n.status === "failed") &&
          n.attempts < options.maxAttempts,
      );

      if (eligible.length === 0) return;

      const controller = new AbortController();
      abortControllerRef.current = controller;
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
        await runQueue(
          eligible,
          async (record, ctx) => {
            options.onUpdate(record.job.id, {
              status: "sending",
              attempts: record.attempts + 1,
              lastError: undefined,
            });

            try {
              const jitter = 250 + Math.floor(Math.random() * 650);
              await sleep(jitter, ctx.signal);

              const fail = Math.random() < 0.2;
              if (fail) {
                throw new Error("Simulated send failure");
              }

              options.onUpdate(record.job.id, { status: "sent" });
              return { id: record.job.id };
            } catch (e) {
              if (ctx.signal?.aborted) throw e;

              options.onUpdate(record.job.id, {
                status: "failed",
                lastError: e instanceof Error ? e.message : "Unknown error",
              });

              return { id: record.job.id };
            }
          },
          {
            concurrency: options.concurrency,
            signal: controller.signal,
            onProgress: (p) => {
              latestRunningCompletedRef.current = p.completed;
              setState({
                status: "running",
                startedAt: startedAtRef.current ?? Date.now(),
                completed: p.completed,
                total: p.total,
                running: p.running,
                pending: p.pending,
              });
            },
          },
        );

        setState({ status: "done", completed: eligible.length, total: eligible.length });
      } catch (e) {
        if (controller.signal.aborted) {
          setState({
            status: "aborted",
            completed: latestRunningCompletedRef.current,
            total: eligible.length,
          });
          return;
        }

        if (e instanceof Error) {
          // The worker handles per-item status, but this ensures the queue doesn't crash silently.
          // No-op.
        }
        throw e;
      } finally {
        abortControllerRef.current = null;
        startedAtRef.current = null;
      }
    },
    [],
  );

  return useMemo(
    () => ({
      state,
      sendAll,
      abort,
    }),
    [state, sendAll, abort],
  );
};
