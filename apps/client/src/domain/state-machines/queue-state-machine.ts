/**
 * Queue state machine — pure domain (RBT-040, FR-05/08).
 *
 * The virtual waiting room is the system's core risk surface, so its lifecycle
 * is modeled as an explicit, deterministic state machine rather than scattered
 * conditionals. This module is framework-free (no React / RN / Expo / browser /
 * native imports) and depends only on the frozen `QueueRepository` port enum and
 * the domain error taxonomy — it imports NOTHING from infrastructure or
 * presentation (Dependency Rule, ARCHITECTURE §3).
 *
 * The machine answers two questions:
 *   1. May a queue entry move from status A to status B? (`canTransition` /
 *      `nextStatus`) — the transition table is the single source of truth.
 *   2. Does a status authorize progression to claim/checkout? (`authorizes` /
 *      `isAdmitted`) — the SAFETY invariant: ONLY `ADMITTED` authorizes.
 *
 * Enum note (docs-win reconciliation): the ticket lists 8 statuses but the
 * frozen port enum (`QueueStatus`) has 9 — it adds `COMPLETED`. The port is the
 * superset and the binding contract, so the machine is modeled to the port:
 * `COMPLETED` is a terminal state alongside `ENDED` (the successful end of a
 * CLAIMED entry's checkout), which is a strict superset of the ticket's 8 and
 * contradicts nothing. No blocker.
 */
import { DomainError } from "@domain/errors/domain-error";
import type { QueueStatus } from "@domain/repositories/queue.repository";

/**
 * Active (non-terminal) states, in lifecycle order. A `WAITING` entry may be
 * `ADMITTED` (its turn), then `CLAIMED` (it grabbed a slot).
 */
export const ACTIVE_STATES: readonly QueueStatus[] = [
  "WAITING",
  "ADMITTED",
  "CLAIMED",
];

/**
 * Terminal states — once here, an entry never transitions again. `COMPLETED`
 * (checkout finished) and `ENDED` (event over) are success/terminal; the rest
 * are early exits (turn missed, user left, stock gone, sales closed).
 */
export const TERMINAL_STATES: readonly QueueStatus[] = [
  "MISSED",
  "LEFT",
  "SOLD_OUT",
  "CLOSED",
  "COMPLETED",
  "ENDED",
];

/**
 * The legal transition table — the single source of truth. A key maps to the
 * set of statuses it may transition INTO. Terminal states map to an empty
 * array (no further transitions). No status lists itself (no self-loops).
 */
export const QUEUE_TRANSITIONS: Readonly<
  Record<QueueStatus, readonly QueueStatus[]>
> = {
  // Waiting in line: get your turn, miss it, leave, or the sale ends around you.
  WAITING: ["ADMITTED", "MISSED", "LEFT", "SOLD_OUT", "CLOSED", "ENDED"],
  // Admitted (the ONLY authorized state): claim a slot, miss the TTL, leave,
  // find it sold out, or the event ends.
  ADMITTED: ["CLAIMED", "MISSED", "LEFT", "SOLD_OUT", "ENDED"],
  // Claimed a slot: complete checkout, let the hold expire (miss), leave, or
  // the event ends.
  CLAIMED: ["COMPLETED", "MISSED", "LEFT", "ENDED"],
  // Terminal — no exits.
  MISSED: [],
  LEFT: [],
  SOLD_OUT: [],
  CLOSED: [],
  COMPLETED: [],
  ENDED: [],
};

/** True iff `status` is a terminal state (allows no further transitions). */
export function isTerminal(status: QueueStatus): boolean {
  return TERMINAL_STATES.includes(status);
}

/**
 * The authorization invariant (FR-08 safety property): ONLY an `ADMITTED` entry
 * is authorized to progress to claim/checkout. Every other status — including
 * `WAITING`, `CLAIMED`, and all terminal states — is unauthorized.
 */
export function isAdmitted(status: QueueStatus): boolean {
  return status === "ADMITTED";
}

/** Alias for the authorization invariant, read at the call site as a gate. */
export function authorizes(status: QueueStatus): boolean {
  return isAdmitted(status);
}

/**
 * Whether moving `from → to` is a legal transition per the table. Unknown
 * source statuses have no table entry → no legal transitions (returns false).
 */
export function canTransition(from: QueueStatus, to: QueueStatus): boolean {
  const allowed = QUEUE_TRANSITIONS[from];
  return allowed !== undefined && allowed.includes(to);
}

/**
 * Guarded transition: returns `to` when `from → to` is legal, otherwise throws
 * a typed `DomainError` (kind `conflict`, code `INVALID_QUEUE_TRANSITION`) with
 * a Bahasa user message and a diagnostic `from`/`to` in the error message.
 */
export function nextStatus(from: QueueStatus, to: QueueStatus): QueueStatus {
  if (!canTransition(from, to)) {
    throw new DomainError({
      kind: "conflict",
      code: "INVALID_QUEUE_TRANSITION",
      userMessage: "Status antrean tidak dapat berubah. Muat ulang antrean.",
    });
  }
  return to;
}
