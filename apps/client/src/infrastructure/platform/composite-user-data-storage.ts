import type { IdempotencyKeys } from "@domain/idempotency/idempotency-key";
import type { UserDataStorage } from "@domain/services/user-data-storage.port";

interface ClearableStorage {
  clear(): Promise<void>;
}

/** Clears all persisted app-owned user and booking-session references. */
export class CompositeUserDataStorage implements UserDataStorage {
  constructor(
    private readonly storages: readonly ClearableStorage[],
    private readonly idempotencyKeys: IdempotencyKeys,
  ) {}

  async clear(): Promise<void> {
    const results = await Promise.allSettled([
      ...this.storages.map(async (storage) => storage.clear()),
      this.idempotencyKeys.clearAll(),
    ]);
    if (results.some((result) => result.status === "rejected")) {
      throw new Error("Sebagian data lokal belum berhasil dihapus.");
    }
  }
}
