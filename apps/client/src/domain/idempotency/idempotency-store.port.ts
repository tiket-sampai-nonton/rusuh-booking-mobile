/**
 * IdempotencyStore — domain PORT (ARCHITECTURE §2.1 DIP; RBT-012, FR-25, D3.3).
 *
 * Pure TS interface: no React / RN / Expo / browser / native imports. Abstracts
 * where idempotency keys are persisted so the key logic is storage-agnostic and
 * deterministic in tests. The composition root binds a concrete adapter (real
 * AsyncStorage/secure-store later; an in-memory fake in tests).
 *
 * Keyed by a stable `actionId` (one logical action = one key across retries).
 */
export interface IdempotencyStore {
  /** The persisted key for this action, or undefined if none yet. */
  get(actionId: string): string | undefined;
  /** Persist the key for this action. */
  set(actionId: string, key: string): void;
  /** Remove the key (called when the action reaches a terminal state). */
  delete(actionId: string): void;
}
