/**
 * RequestOtp — application use case (RBT-020, E3).
 *
 * Sends a 6-digit OTP to an email via the {@link UserRepository} port. PURE TS:
 * takes the port by constructor injection, imports domain only (no React / RN /
 * Expo / infrastructure). Anti-enumeration is a BE concern (the port always
 * resolves the same way); the use case just normalizes input and delegates.
 */
import type { UserRepository } from "@domain/repositories/user.repository";

export class RequestOtp {
  constructor(private readonly users: UserRepository) {}

  /** Request an OTP for the (trimmed) email. Resolves when the send is accepted. */
  async execute(email: string): Promise<void> {
    await this.users.requestOtp(email.trim());
  }
}
