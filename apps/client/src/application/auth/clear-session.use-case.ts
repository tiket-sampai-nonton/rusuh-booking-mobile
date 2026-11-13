/**
 * ClearSession — application use case (RBT-023, E3).
 *
 * Removes app-owned account and active-journey data on sign-out through the
 * {@link UserDataStorage} port. PURE TS: constructor-injected port, domain-only
 * imports. Persistence details remain in infrastructure.
 */
import type { UserDataStorage } from "@domain/services/user-data-storage.port";

export class ClearSession {
  constructor(private readonly userDataStorage: UserDataStorage) {}

  /** Clear auth, profile prefill, queue, payment, and idempotency storage. */
  async execute(): Promise<void> {
    await this.userDataStorage.clear();
  }
}
