/**
 * QueueMembershipStorage — domain PORT (ARCHITECTURE §2.1 DIP, §3; RBT-041, E5
 * Queue). Mirrors the RBT-023 `TokenStorage` port: a pure-TS persistence
 * abstraction for the ANONYMOUS waiting-room membership so a refresh / restart
 * restores the slot (D8.5 guest flow — no auth).
 *
 * Pure TS interface: no React / RN / Expo / browser / native imports. Abstracts
 * WHERE the membership is persisted so the join / restore use cases are
 * storage-agnostic and deterministic in tests. The composition root binds a
 * concrete adapter: secure storage on native (expo-secure-store), a
 * non-persistent in-memory fallback on web/tests (SecureStore is native-only;
 * on web the membership lives in memory only and does NOT survive a reload).
 */

/** The persisted anonymous waiting-room membership. Minimal by design: just the
 * two ids the waiting room needs to resume polling (the queue entry's live
 * status is re-fetched from the server, never trusted from storage). */
export interface QueueMembership {
  readonly eventId: string;
  readonly queueId: string;
}

export interface QueueMembershipStorage {
  /** Persist the membership (overwrites any existing value). */
  save(membership: QueueMembership): Promise<void>;
  /** The persisted membership, or null if none is stored. */
  load(): Promise<QueueMembership | null>;
  /** Remove the persisted membership. Idempotent when already empty. */
  clear(): Promise<void>;
}
