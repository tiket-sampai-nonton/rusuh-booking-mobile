/**
 * GetCheckoutUserDetails — authenticated checkout prefill (application layer).
 *
 * The result contains real account email/NIK values and is intended to live
 * only in the mounted checkout screen. It must not be sent to storage, logs,
 * or the shared account profile.
 */
import type {
  CheckoutUserDetails,
  UserRepository,
} from "@domain/repositories/user.repository";

export class GetCheckoutUserDetails {
  constructor(private readonly users: UserRepository) {}

  execute(): Promise<CheckoutUserDetails> {
    return this.users.getCheckoutDetails();
  }
}
