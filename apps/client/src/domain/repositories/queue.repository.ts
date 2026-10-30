/**
 * QueueRepository — domain PORT (ARCHITECTURE §2.1, §3, §4.1, §4.4).
 *
 * Pure TS: no React / RN / Expo / browser / native / codegen imports.
 * Infrastructure implements this port (`HttpQueueRepository`); the composition
 * root binds the concrete adapter.
 *
 * RBT-010: refined to the Queue-service contract (QueueEntry). Domain entity —
 * minimal fields the waiting-room needs (ISP), not the full wire DTO. Join is
 * anonymous (FE-NEED O1: buyer NIK/email collected later at checkout).
 */

/** Queue-entry lifecycle (contract enum). */
export type QueueStatus =
  | "WAITING"
  | "ADMITTED"
  | "CLAIMED"
  | "MISSED"
  | "LEFT"
  | "SOLD_OUT"
  | "CLOSED"
  | "COMPLETED"
  | "ENDED";

/** Admission-zone hint for "jangan PHP" display (FR/NFR-05). */
export type QueueZone = "GUARANTEED" | "POSSIBLE" | "NOT_ENOUGH";

/** A queue entry (position + status), persisted across refresh by the caller. */
export interface QueueEntry {
  readonly queueId: string;
  readonly eventId: string;
  readonly position: number;
  readonly status: QueueStatus;
  readonly zone?: QueueZone;
  /** Adaptive-poll hint from the server (ms); caller honors it. */
  readonly nextPollAfterMs?: number;
  /** Server clock for skew correction (ISO-8601). */
  readonly serverTime?: string;
}

export interface QueueRepository {
  /** Join the waiting room anonymously; returns the issued entry. */
  join(eventId: string): Promise<QueueEntry>;
  /** Observe the latest status for a previously-issued entry. */
  getStatus(queueId: string): Promise<QueueEntry>;
  /** Leave the waiting room. */
  leave(queueId: string): Promise<void>;
}
