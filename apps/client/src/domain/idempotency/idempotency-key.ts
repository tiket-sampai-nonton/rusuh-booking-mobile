/**
 * Idempotency-Key handling — domain (RBT-012, FR-25, D3.3).
 *
 * One key per logical action, minted once and REUSED across retry/refresh, then
 * CLEARED on a terminal outcome. This is what feeds the `idempotencyKey` param
 * the repositories (RBT-010) forward as the `Idempotency-Key` header, so a
 * double-submit or a refresh-and-retry cannot create a second booking/payment.
 *
 * Pure TS: no framework, no crypto dependency — the generator uses only
 * `Date.now()` + `Math.random()` hex, which is sufficient for a client-side
 * idempotency token (uniqueness per device/session, not a security secret).
 */
import type { IdempotencyStore } from "@domain/idempotency/idempotency-store.port";

/** Generate a fresh key: time-anchored + random, no external dependency. */
export function generateKey(): string {
  const time = Date.now().toString(16);
  const rand = Math.random().toString(16).slice(2, 10);
  const rand2 = Math.random().toString(16).slice(2, 10);
  return `idem_${time}_${rand}${rand2}`;
}

export class IdempotencyKeys {
  constructor(
    private readonly store: IdempotencyStore,
    private readonly gen: () => string = generateKey,
  ) {}

  /**
   * Return the key for `actionId`, minting + persisting one on first call and
   * reusing the SAME key on every later call (retry/refresh/double-submit).
   */
  mint(actionId: string): string {
    const existing = this.store.get(actionId);
    if (existing !== undefined) return existing;
    const key = this.gen();
    this.store.set(actionId, key);
    return key;
  }

  /** Read the current key without minting (undefined if none). */
  peek(actionId: string): string | undefined {
    return this.store.get(actionId);
  }

  /** Clear the key once the action reaches a terminal state. */
  clear(actionId: string): void {
    this.store.delete(actionId);
  }
}
