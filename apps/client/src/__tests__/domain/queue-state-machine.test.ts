import { DomainError } from "@domain/errors/domain-error";
import type { QueueStatus } from "@domain/repositories/queue.repository";
import {
  ACTIVE_STATES,
  TERMINAL_STATES,
  QUEUE_TRANSITIONS,
  authorizes,
  canTransition,
  isAdmitted,
  isTerminal,
  nextStatus,
} from "@domain/state-machines/queue-state-machine";

/**
 * RBT-040 — Queue state machine (pure domain).
 *
 * The waiting room is the system's core risk surface, so these tests are
 * exhaustive on the transition table and especially on the authorization
 * invariant: ONLY `ADMITTED` authorizes progression to claim/checkout.
 */

/** Every status in the frozen QueueRepository port enum (the superset). */
const ALL_STATUSES: readonly QueueStatus[] = [
  "WAITING",
  "ADMITTED",
  "CLAIMED",
  "MISSED",
  "LEFT",
  "SOLD_OUT",
  "CLOSED",
  "COMPLETED",
  "ENDED",
];

/** The transition table expressed independently of the implementation. */
const LEGAL: Readonly<Record<QueueStatus, readonly QueueStatus[]>> = {
  WAITING: ["ADMITTED", "MISSED", "LEFT", "SOLD_OUT", "CLOSED", "ENDED"],
  ADMITTED: ["CLAIMED", "MISSED", "LEFT", "SOLD_OUT", "ENDED"],
  CLAIMED: ["COMPLETED", "MISSED", "LEFT", "ENDED"],
  MISSED: [],
  LEFT: [],
  SOLD_OUT: [],
  CLOSED: [],
  COMPLETED: [],
  ENDED: [],
};

describe("domain/queue-state-machine — state sets", () => {
  it("partitions the port enum into active + terminal with no overlap and no gaps", () => {
    const union = new Set<QueueStatus>([...ACTIVE_STATES, ...TERMINAL_STATES]);
    expect(union.size).toBe(ALL_STATUSES.length); // disjoint (no dup collapsed)
    for (const s of ALL_STATUSES) expect(union.has(s)).toBe(true); // complete
    expect(ACTIVE_STATES).toEqual(["WAITING", "ADMITTED", "CLAIMED"]);
    expect([...TERMINAL_STATES].sort()).toEqual(
      ["CLOSED", "COMPLETED", "ENDED", "LEFT", "MISSED", "SOLD_OUT"].sort(),
    );
  });

  it("isTerminal is true for exactly the terminal states", () => {
    for (const s of ALL_STATUSES) {
      expect(isTerminal(s)).toBe(TERMINAL_STATES.includes(s));
    }
  });

  it("QUEUE_TRANSITIONS matches the expected table exactly", () => {
    for (const from of ALL_STATUSES) {
      expect([...QUEUE_TRANSITIONS[from]].sort()).toEqual(
        [...LEGAL[from]].sort(),
      );
    }
  });
});

describe("domain/queue-state-machine — authorization invariant (safety)", () => {
  it("ONLY ADMITTED authorizes progression", () => {
    for (const s of ALL_STATUSES) {
      expect(authorizes(s)).toBe(s === "ADMITTED");
      expect(isAdmitted(s)).toBe(s === "ADMITTED");
    }
  });

  it("every non-ADMITTED status is unauthorized", () => {
    const unauthorized = ALL_STATUSES.filter((s) => s !== "ADMITTED");
    expect(unauthorized.every((s) => authorizes(s) === false)).toBe(true);
    expect(unauthorized).toHaveLength(8);
  });
});

describe("domain/queue-state-machine — canTransition", () => {
  it("allows every legal transition in the table", () => {
    for (const from of ALL_STATUSES) {
      for (const to of LEGAL[from]) {
        expect(canTransition(from, to)).toBe(true);
      }
    }
  });

  it("rejects every transition NOT in the table (exhaustive complement)", () => {
    for (const from of ALL_STATUSES) {
      const legal = new Set<QueueStatus>(LEGAL[from]);
      for (const to of ALL_STATUSES) {
        if (!legal.has(to)) {
          expect(canTransition(from, to)).toBe(false);
        }
      }
    }
  });

  it("rejects self-transitions (no status transitions to itself)", () => {
    for (const s of ALL_STATUSES) {
      expect(canTransition(s, s)).toBe(false);
    }
  });

  it("rejects representative illegal transitions", () => {
    expect(canTransition("CLAIMED", "WAITING")).toBe(false); // no going back
    expect(canTransition("ADMITTED", "WAITING")).toBe(false);
    expect(canTransition("WAITING", "CLAIMED")).toBe(false); // must be admitted first
    expect(canTransition("WAITING", "COMPLETED")).toBe(false);
    expect(canTransition("ADMITTED", "COMPLETED")).toBe(false); // claim first
    expect(canTransition("MISSED", "WAITING")).toBe(false); // terminal
    expect(canTransition("COMPLETED", "ENDED")).toBe(false); // terminal → terminal
  });

  it("no terminal state transitions anywhere", () => {
    for (const from of TERMINAL_STATES) {
      for (const to of ALL_STATUSES) {
        expect(canTransition(from, to)).toBe(false);
      }
    }
  });

  it("treats an unknown status as having no legal transitions", () => {
    const bogus = "NOPE" as QueueStatus;
    for (const to of ALL_STATUSES) {
      expect(canTransition(bogus, to)).toBe(false);
    }
    expect(canTransition("WAITING", bogus)).toBe(false);
    expect(isTerminal(bogus)).toBe(false);
    expect(authorizes(bogus)).toBe(false);
  });
});

describe("domain/queue-state-machine — nextStatus (guarded transition)", () => {
  it("returns the target for a legal transition", () => {
    expect(nextStatus("WAITING", "ADMITTED")).toBe("ADMITTED");
    expect(nextStatus("ADMITTED", "CLAIMED")).toBe("CLAIMED");
    expect(nextStatus("CLAIMED", "COMPLETED")).toBe("COMPLETED");
  });

  it("throws a DomainError (kind=conflict) on an illegal transition", () => {
    expect(() => nextStatus("CLAIMED", "WAITING")).toThrow(DomainError);
    try {
      nextStatus("CLAIMED", "WAITING");
      throw new Error("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(DomainError);
      const de = e as DomainError;
      expect(de.kind).toBe("conflict");
      expect(de.code).toBe("INVALID_QUEUE_TRANSITION");
      expect(de.userMessage.length).toBeGreaterThan(0);
      expect(de.message).toContain("INVALID_QUEUE_TRANSITION");
    }
  });

  it("throws on any transition out of a terminal state", () => {
    for (const from of TERMINAL_STATES) {
      expect(() => nextStatus(from, "WAITING")).toThrow(DomainError);
    }
  });

  it("throws on an unknown source status", () => {
    const bogus = "NOPE" as QueueStatus;
    expect(() => nextStatus(bogus, "WAITING")).toThrow(DomainError);
  });
});
