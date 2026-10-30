/**
 * QueueRepository — domain PORT (ARCHITECTURE §2.1, §3, §4.1, §4.4).
 *
 * Pure TS interface: no React / React Native / Expo / browser / native imports.
 * Infrastructure implements this port (RBT-010 HttpQueueRepository); the
 * composition root binds the concrete adapter.
 *
 * Shapes are minimal placeholders for RBT-004 wiring; RBT-010/RBT-040 refine
 * them against the queue contract.
 */

/** Minimal queue-ticket placeholder — superseded by contract types in RBT-010. */
export interface QueueTicket {
  readonly queueId: string;
  readonly position: number;
}

export interface QueueRepository {
  /** Join the waiting room for an event; returns the issued queue ticket. */
  join(eventId: string): Promise<QueueTicket>;
  /** Observe the latest queue status for a previously-issued ticket. */
  getStatus(queueId: string): Promise<QueueTicket>;
  /** Leave the waiting room. */
  leave(queueId: string): Promise<void>;
}
