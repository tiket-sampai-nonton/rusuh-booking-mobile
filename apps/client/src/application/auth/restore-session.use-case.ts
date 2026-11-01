/**
 * RestoreSession — application use case (RBT-023, E3).
 *
 * Loads any previously-persisted auth token on app start via the
 * {@link TokenStorage} port (returns null when none is stored, e.g. a fresh
 * install or after sign-out). PURE TS: constructor-injected port, domain-only
 * imports. Thin by design — no branching beyond the port's own contract.
 *
 * SECURITY: the raw token is returned to the caller and NEVER logged here.
 */
import type { TokenStorage } from "@domain/auth/token-storage.port";

export class RestoreSession {
  constructor(private readonly storage: TokenStorage) {}

  /** The persisted session token, or null if there is no stored session. */
  async execute(): Promise<string | null> {
    return this.storage.load();
  }
}
