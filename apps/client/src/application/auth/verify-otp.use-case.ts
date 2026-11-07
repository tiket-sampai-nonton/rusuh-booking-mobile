/**
 * VerifyOtp — application use case (RBT-020, E3).
 *
 * Exchanges an email + 6-digit OTP for an {@link AuthSession} ({ token, isNew })
 * via the {@link UserRepository} port. PURE TS: constructor-injected port,
 * domain-only imports.
 *
 * SECURITY: the raw OTP `code` and the returned `token` are NEVER logged here.
 * On failure the use case surfaces a typed {@link DomainError} (an already-typed
 * DomainError from the adapter is passed through untouched; any other rejection
 * is mapped to OTP_INVALID with a Bahasa user message) so the UI reasons about
 * `kind`/`userMessage` instead of a transport-specific Error.
 */
import { DomainError } from "@domain/errors/domain-error";
import { mapFailure } from "@domain/errors/error-mapper";
import type {
  AuthSession,
  UserRepository,
} from "@domain/repositories/user.repository";

export class VerifyOtp {
  constructor(private readonly users: UserRepository) {}

  /**
   * Verify the OTP and return the auth session. The email is trimmed and the
   * code reduced to digits before delegating to the port.
   */
  async execute(email: string, code: string): Promise<AuthSession> {
    const normalizedEmail = email.trim();
    const normalizedCode = code.replace(/\D/g, "");
    try {
      return await this.users.verifyOtp(normalizedEmail, normalizedCode);
    } catch (cause) {
      if (cause instanceof DomainError) {
        throw cause;
      }
      // Any non-typed failure (incl. the mock's "invalid OTP") becomes a
      // domain-meaningful auth error. The raw code/token never appear here.
      throw mapFailure(cause, "OTP_INVALID");
    }
  }
}
