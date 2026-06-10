export type MaybeArray<T> = T | readonly T[];

export const normalizeNotifications = <T>(
  input: MaybeArray<T> | null | undefined,
): T[] => {
  if (input == null) return [];
  if (Array.isArray(input)) {
    return [...(input as readonly T[])];
  }
  return [input as T];
};
