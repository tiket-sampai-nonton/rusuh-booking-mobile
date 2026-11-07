/**
 * Neutral shared helpers (framework-free).
 * RBT-001 ships one real util so the test harness proves a meaningful assertion;
 * the full helper set grows with later tasks.
 */

/** App display name, surfaced on the skeleton home route. */
export const APP_NAME = "Rusuh Booking";

/**
 * Clamp a number into an inclusive range.
 * @returns the value bounded to [min, max].
 * Used later by timer/quantity math; lives here as the first real shared unit.
 */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new RangeError("clamp: min must be <= max");
  }
  return Math.min(Math.max(value, min), max);
}
