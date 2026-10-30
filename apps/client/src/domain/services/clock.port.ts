/**
 * ClockPort — domain PORT (ARCHITECTURE §2.1, §4.2).
 *
 * Pure TS interface: no React / React Native / Expo / browser / native imports.
 * Abstracts the wall clock so the server-authoritative `ServerClock` (RBT-011)
 * never depends on the device `Date` directly and is deterministic in tests.
 * The composition root binds a concrete adapter (real `Date.now` or a fake).
 */
export interface ClockPort {
  /** Current time in epoch milliseconds. */
  now(): number;
}
