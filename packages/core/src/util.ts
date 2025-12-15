/**
 * Generate a UUID v4 using `crypto.randomUUID` when available; otherwise fall back
 * to the classic template with random nibbles (uses `crypto.getRandomValues` when possible).
 */
export function generateUuid(): string {
  const cryptoSource: Crypto | undefined =
    typeof crypto !== "undefined" ? (crypto as Crypto) : undefined;

  if (typeof cryptoSource?.randomUUID === "function") {
    try {
      return cryptoSource.randomUUID();
    } catch {
      // ignore and use fallback
    }
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const rand = cryptoSource?.getRandomValues
      ? cryptoSource.getRandomValues(new Uint8Array(1))[0] & 0xf
      : Math.floor(Math.random() * 16);
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
