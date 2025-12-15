/**
 * Check if a value is a finite number greater than zero.
 */
export function isNumberFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
