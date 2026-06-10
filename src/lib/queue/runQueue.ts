export type QueueProgress<T> = {
  total: number;
  completed: number;
  running: number;
  pending: number;
  lastCompletedItem?: T;
};

export type RunQueueOptions<T> = {
  concurrency: number;
  signal?: AbortSignal;
  onProgress?: (progress: QueueProgress<T>) => void;
};

export type RunQueueResult<T, R> = {
  results: Array<PromiseSettledResult<R>>;
};

export const runQueue = async <T>(
  concurrency: number,
  jobs: Array<() => Promise<T>>,
): Promise<T[]> => {
  const max = Math.max(1, Math.floor(concurrency));
  const results: T[] = new Array(jobs.length);

  let nextIndex = 0;

  const worker = async (): Promise<void> => {
    while (true) {
      const current = nextIndex;
      nextIndex += 1;
      if (current >= jobs.length) return;

      results[current] = await jobs[current]();
    }
  };

  const runners = Array.from({ length: Math.min(max, jobs.length) }, () => worker());
  await Promise.all(runners);
  return results;
};

export class AbortError extends Error {
  override name = "AbortError";

  constructor(message = "The operation was aborted") {
    super(message);
  }
}

const throwIfAborted = (signal: AbortSignal | undefined) => {
  if (signal?.aborted) {
    throw new AbortError();
  }
};

export const runQueueWithWorker = async <T, R>(
  items: readonly T[],
  worker: (item: T, ctx: { signal?: AbortSignal }) => Promise<R>,
  options: RunQueueOptions<T>,
): Promise<RunQueueResult<T, R>> => {
  const concurrency = Math.max(1, Math.floor(options.concurrency));
  const signal = options.signal;

  const results: Array<PromiseSettledResult<R>> = new Array(items.length);

  let nextIndex = 0;
  let running = 0;
  let completed = 0;

  const emitProgress = (lastCompletedItem?: T) => {
    options.onProgress?.({
      total: items.length,
      completed,
      running,
      pending: items.length - completed - running,
      lastCompletedItem,
    });
  };

  const runOne = async (index: number): Promise<void> => {
    const item = items[index];
    running += 1;
    emitProgress();

    try {
      throwIfAborted(signal);
      const value = await worker(item, { signal });
      results[index] = { status: "fulfilled", value };
    } catch (reason) {
      results[index] = { status: "rejected", reason };
    } finally {
      running -= 1;
      completed += 1;
      emitProgress(item);
    }
  };

  const pump = async (): Promise<void> => {
    while (true) {
      throwIfAborted(signal);

      const index = nextIndex;
      if (index >= items.length) return;

      if (running >= concurrency) return;

      nextIndex += 1;
      void runOne(index).then(pump);
      return;
    }
  };

  emitProgress();

  const starters = Math.min(concurrency, items.length);
  const initial: Array<Promise<void>> = [];

  for (let i = 0; i < starters; i += 1) {
    initial.push(pump());
  }

  await Promise.all(initial);

  while (completed < items.length) {
    throwIfAborted(signal);
    await new Promise((r) => setTimeout(r, 0));
  }

  throwIfAborted(signal);

  return { results };
};
