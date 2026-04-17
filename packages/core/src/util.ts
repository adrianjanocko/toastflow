/**
 * Generate a UUID v4 using `crypto.randomUUID` when available; otherwise fall back
 * to the classic template with random nibbles (uses `crypto.getRandomValues` when possible).
 */
import type { ToastType } from "./types";

type CryptoLike = {
  randomUUID?: () => string;
  getRandomValues?: (arr: Uint8Array) => Uint8Array;
};

export function generateUuid(): string {
  const cryptoApi: CryptoLike | undefined = (
    globalThis as unknown as { crypto?: CryptoLike }
  )?.crypto;

  if (typeof cryptoApi?.randomUUID === "function") {
    try {
      return cryptoApi.randomUUID();
    } catch {
      // ignore and use fallback
    }
  }

  function randomNibble(): number {
    if (typeof cryptoApi?.getRandomValues === "function") {
      const bytes = new Uint8Array(1);
      cryptoApi.getRandomValues(bytes);
      return (bytes[0] ?? 0) & 0xf;
    }
    return Math.floor(Math.random() * 16);
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const rand = randomNibble();
    const value = c === "x" ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * Check if a value is a finite number greater than zero.
 */
export function isNumberFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/**
 * Valid toast type values.
 */
export const VALID_TOAST_TYPES = new Set<ToastType>([
  "loading",
  "default",
  "success",
  "error",
  "info",
  "warning",
  "custom",
]);

/**
 * Default formatter for createdAt timestamps.
 */
export function defaultCreatedAtFormatter(createdAt: number): string {
  try {
    return new Date(createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return new Date(createdAt).toISOString();
  }
}
