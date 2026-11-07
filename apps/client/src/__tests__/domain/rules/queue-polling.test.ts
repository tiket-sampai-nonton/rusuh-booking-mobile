/**
 * RBT-042 — adaptive poll-interval rule (pure domain). Verifies: the server
 * `nextPollAfterMs` is honoured, the anti-storm floor clamps low/absent hints,
 * jitter is additive and bounded, and reduced motion raises the floor.
 */
import type { QueueEntry } from "@domain/repositories/queue.repository";
import {
  DEFAULT_POLL_MS,
  MAX_JITTER_MS,
  MIN_POLL_MS,
  REDUCED_MOTION_MIN_POLL_MS,
  basePollIntervalMs,
  pollIntervalMs,
} from "@domain/rules/queue-polling";

const entry = (
  nextPollAfterMs?: number,
): Pick<QueueEntry, "nextPollAfterMs"> => ({
  nextPollAfterMs,
});

describe("RBT-042 basePollIntervalMs", () => {
  it("honours the server nextPollAfterMs when above the floor", () => {
    expect(basePollIntervalMs(entry(2000))).toBe(2000);
    expect(basePollIntervalMs(entry(8000))).toBe(8000);
  });

  it("falls back to DEFAULT_POLL_MS when the hint is missing", () => {
    expect(basePollIntervalMs(entry(undefined))).toBe(DEFAULT_POLL_MS);
    expect(basePollIntervalMs({})).toBe(DEFAULT_POLL_MS);
  });

  it("falls back to DEFAULT_POLL_MS for a non-finite hint", () => {
    expect(basePollIntervalMs(entry(Number.NaN))).toBe(DEFAULT_POLL_MS);
    expect(basePollIntervalMs(entry(Number.POSITIVE_INFINITY))).toBe(
      DEFAULT_POLL_MS,
    );
  });

  it("clamps a below-floor hint up to MIN_POLL_MS (anti-storm, NFR-06)", () => {
    expect(basePollIntervalMs(entry(0))).toBe(MIN_POLL_MS);
    expect(basePollIntervalMs(entry(50))).toBe(MIN_POLL_MS);
    expect(basePollIntervalMs(entry(-1000))).toBe(MIN_POLL_MS);
  });

  it("raises the floor under reduced motion", () => {
    expect(basePollIntervalMs(entry(2000), true)).toBe(
      REDUCED_MOTION_MIN_POLL_MS,
    );
    expect(basePollIntervalMs(entry(undefined), true)).toBe(
      REDUCED_MOTION_MIN_POLL_MS,
    );
    // A hint above the reduced-motion floor is still honoured.
    expect(basePollIntervalMs(entry(6000), true)).toBe(6000);
  });
});

describe("RBT-042 pollIntervalMs (jitter)", () => {
  it("adds the full jitter when random() is near 1", () => {
    // random ~0.999 → floor(0.999 * 500) = 499
    expect(pollIntervalMs(entry(2000), false, () => 0.999)).toBe(2000 + 499);
  });

  it("adds zero jitter when random() is 0 (base is the lower bound)", () => {
    expect(pollIntervalMs(entry(2000), false, () => 0)).toBe(2000);
  });

  it("jitter is always additive and bounded: base <= result < base + MAX_JITTER_MS", () => {
    const base = basePollIntervalMs(entry(2000));
    for (let i = 0; i < 1000; i++) {
      const wait = pollIntervalMs(entry(2000)); // real Math.random
      expect(wait).toBeGreaterThanOrEqual(base);
      expect(wait).toBeLessThan(base + MAX_JITTER_MS);
    }
  });

  it("never dips under the anti-storm floor even for a zero hint", () => {
    for (let i = 0; i < 500; i++) {
      expect(pollIntervalMs(entry(0))).toBeGreaterThanOrEqual(MIN_POLL_MS);
    }
  });

  it("respects the reduced-motion floor with jitter on top", () => {
    const wait = pollIntervalMs(entry(2000), true, () => 0.5);
    expect(wait).toBe(REDUCED_MOTION_MIN_POLL_MS + 250);
  });
});
