/**
 * PersistSession — application use case (RBT-023, E3).
 *
 * Saves the auth session token (from a successful OTP verify) via the
 * {@link TokenStorage} port so it survives app restarts on native. PURE TS:
 * constructor-injected port, domain-only imports (no React / RN / Expo /
 * infrastructure). Thin by design — the use case just delegates to the port.
 *
 * SECURITY: the raw token is passed straight to the port and NEVER logged here.
 */
import type { TokenStorage } from "@domain/auth/token-storage.port";

export class PersistSession {
  constructor(private readonly storage: TokenStorage) {}

  /** Persist the issued session token. Resolves once stored. */
  async execute(token: string): Promise<void> {
    await this.storage.save(token);
  }
}
