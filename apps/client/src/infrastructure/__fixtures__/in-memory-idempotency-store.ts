/**
 * InMemoryIdempotencyStore — adapter for `IdempotencyStore` (RBT-012).
 *
 * A process-lifetime Map-backed store. Used as the dev/test binding; a durable
 * adapter (AsyncStorage / secure-store) is swapped in at the composition root
 * when persistence across app restarts is required. Framework-free.
 */
import type { IdempotencyStore } from "@domain/idempotency/idempotency-store.port";

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly keys = new Map<string, string>();

  get(actionId: string): string | undefined {
    return this.keys.get(actionId);
  }

  set(actionId: string, key: string): void {
    this.keys.set(actionId, key);
  }

  delete(actionId: string): void {
    this.keys.delete(actionId);
  }
}
