/**
 * Adaptive queue-polling interval rule — pure domain (RBT-042, FR Queue / E5,
 * ARCHITECTURE §9.2, NFR-05/06).
 *
 * The waiting room polls the server for the latest queue entry; the SERVER
 * decides the cadence by returning `nextPollAfterMs` on each entry (far → slow,
 * near → fast — the "jangan PHP" adaptive backoff). This module is the single
 * source of truth for turning that hint into the next wait, so the cadence
 * logic is unit-tested in isolation instead of hiding inside a React hook.
 *
 * Framework-free: no React / RN / Expo / browser / native / TanStack imports.
 * It depends only on the frozen `QueueEntry` port shape (the `nextPollAfterMs`
 * field) — nothing from infrastructure or presentation (Dependency Rule, §3).
 *
 * Three jobs:
 *   1. Honour `nextPollAfterMs` when the server sends it; fall back to a safe
 *      default when it is absent (the prototype's 3000 ms fallback).
 *   2. Never poll faster than a hard floor — the anti-storm guard (NFR-06): a
 *      misbehaving/zero server hint can never turn into a tight request loop.
 *   3. Add a small positive jitter so N clients that joined together do not
 *      resynchronise into a thundering herd (NFR-05/06 stampede safety).
 *
 * A reduced-motion variant floors the wait higher (prototype: 4000 ms) so the
 * UI does not churn for users who asked the OS to minimise motion.
 */
import type { QueueEntry } from "@domain/repositories/queue.repository";

/**
 * Fallback cadence (ms) when the server omits `nextPollAfterMs`. Mirrors the
 * prototype's `pollOnce()` default (`waiting.html` ~L210-251).
 */
export const DEFAULT_POLL_MS = 3000;

/**
 * Hard lower bound (ms) on any poll wait — the anti-storm floor (NFR-06). Even
 * a zero/negative server hint cannot produce a wait below this, so the client
 * can never melt the backend with a tight loop.
 */
export const MIN_POLL_MS = 1000;

/**
 * Reduced-motion floor (ms). When the OS asks for reduced motion the prototype
 * slows polling to at least this, trading responsiveness for calm.
 */
export const REDUCED_MOTION_MIN_POLL_MS = 4000;

/**
 * Maximum jitter (ms) added on top of the base wait. Jitter is always
 * ADDITIVE (never subtractive) so it can never pull a wait below the floor and
 * can never speed up the cadence — it only spreads clients out.
 */
export const MAX_JITTER_MS = 500;

/** Injectable RNG for deterministic tests. Returns a value in `[0, 1)`. */
export type Random = () => number;

/**
 * The base poll wait (ms) for an entry, BEFORE jitter: the server's
 * `nextPollAfterMs` clamped up to {@link MIN_POLL_MS}. A missing (or non-finite)
 * hint falls back to {@link DEFAULT_POLL_MS}. When `reducedMotion` is true the
 * floor is raised to {@link REDUCED_MOTION_MIN_POLL_MS}.
 *
 * Pure and deterministic (no jitter) — this is the value tests assert exactly.
 */
export function basePollIntervalMs(
  entry: Pick<QueueEntry, "nextPollAfterMs">,
  reducedMotion = false,
): number {
  const hint = entry.nextPollAfterMs;
  const base =
    typeof hint === "number" && Number.isFinite(hint) ? hint : DEFAULT_POLL_MS;
  const floor = reducedMotion ? REDUCED_MOTION_MIN_POLL_MS : MIN_POLL_MS;
  return Math.max(floor, base);
}

/**
 * The next poll wait (ms) for an entry: {@link basePollIntervalMs} plus a small
 * additive jitter in `[0, MAX_JITTER_MS)`. Pass a deterministic `random` in
 * tests to assert exact values; production uses `Math.random`.
 *
 * Invariant: the result is always `>= basePollIntervalMs(entry, reducedMotion)`
 * and `< base + MAX_JITTER_MS`, so it never dips under the anti-storm floor.
 */
export function pollIntervalMs(
  entry: Pick<QueueEntry, "nextPollAfterMs">,
  reducedMotion = false,
  random: Random = Math.random,
): number {
  const base = basePollIntervalMs(entry, reducedMotion);
  const jitter = Math.floor(random() * MAX_JITTER_MS);
  return base + jitter;
}
