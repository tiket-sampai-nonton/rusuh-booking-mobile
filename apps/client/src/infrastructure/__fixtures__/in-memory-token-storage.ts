/**
 * InMemoryTokenStorage — adapter for `TokenStorage` (RBT-023).
 *
 * A process-lifetime, field-backed store. Used as the web/test binding: on web
 * SecureStore is unsupported, so the token lives only in memory and does NOT
 * survive a page reload (documented tradeoff — SECURITY.md). Framework-free; no
 * React / RN / Expo imports. The secure-store adapter is swapped in on native
 * at the composition root.
 *
 * SECURITY: the raw token is never logged here — it is only held in a private
 * field and returned to the caller.
 */
import type { TokenStorage } from "@domain/auth/token-storage.port";

export class InMemoryTokenStorage implements TokenStorage {
  private token: string | null = null;

  async save(token: string): Promise<void> {
    this.token = token;
  }

  async load(): Promise<string | null> {
    return this.token;
  }

  async clear(): Promise<void> {
    this.token = null;
  }
}
