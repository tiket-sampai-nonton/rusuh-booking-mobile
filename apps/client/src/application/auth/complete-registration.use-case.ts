/**
 * CompleteRegistration — application use case (RBT-021, E3).
 *
 * Completes a NEW account's registration (name + NIK) after OTP verify, via the
 * {@link UserRepository} port. PURE TS: constructor-injected port, domain-only
 * imports (no React / RN / Expo / infrastructure).
 *
 * Input hygiene + defense-in-depth validation BEFORE the port call:
 *  - the full name is trimmed and must be non-empty,
 *  - the NIK is trimmed and must pass the domain {@link validateNik} rule
 *    (16 numeric digits). An invalid NIK/name never reaches the network.
 * The backend validates authoritatively; this local gate just fails fast with a
 * typed {@link DomainError} the UI can surface.
 *
 * SECURITY (SECURITY.md): the raw NIK is passed straight to the port and is
 * NEVER logged here. Only a MASKED {@link UserProfile} is returned to the UI.
 */
import { validateNik } from "@domain/auth/nik";
import { DomainError } from "@domain/errors/domain-error";
import { mapError } from "@domain/errors/error-mapper";
import type {
  UserProfile,
  UserRepository,
} from "@domain/repositories/user.repository";

export interface CompleteRegistrationInput {
  readonly fullName: string;
  readonly nik: string;
}

export class CompleteRegistration {
  constructor(private readonly users: UserRepository) {}

  /**
   * Validate + normalize the input, then complete registration via the port.
   * Rejects with a typed {@link DomainError} on a local validation failure
   * (never touching the port) or on a port failure.
   */
  async execute(input: CompleteRegistrationInput): Promise<UserProfile> {
    const fullName = input.fullName.trim();
    const nik = input.nik.trim();

    if (fullName.length === 0) {
      throw mapError({ code: "VALIDATION_ERROR" });
    }
    if (!validateNik(nik).ok) {
      // Raw NIK never appears in the error (SECURITY).
      throw mapError({ code: "NIK_INVALID" });
    }

    try {
      return await this.users.completeRegistration({ fullName, nik });
    } catch (cause) {
      if (cause instanceof DomainError) {
        throw cause;
      }
      throw mapError({ code: "VALIDATION_ERROR" });
    }
  }
}
