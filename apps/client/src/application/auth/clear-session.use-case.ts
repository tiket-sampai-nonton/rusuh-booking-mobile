/**
 * ClearSession — application use case (RBT-023, E3).
 *
 * Removes the persisted auth token on sign-out via the {@link TokenStorage}
 * port (idempotent — clearing an empty store is a no-op). PURE TS:
 * constructor-injected port, domain-only imports. Thin by design.
 */
import type { TokenStorage } from "@domain/auth/token-storage.port";

export class ClearSession {
  constructor(private readonly storage: TokenStorage) {}

  /** Clear the persisted session token (sign-out). Resolves once removed. */
  async execute(): Promise<void> {
    await this.storage.clear();
  }
}
