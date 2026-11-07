/**
 * MockUserRepository — in-memory adapter for `UserRepository`.
 *
 * Bound under `EXPO_PUBLIC_USE_MOCKS`. Framework-free, deterministic.
 * Passwordless OTP demo: any email + code `123456` verifies. Only a MASKED NIK
 * is ever surfaced (SECURITY — never a raw NIK).
 */
import type {
  AuthSession,
  UserProfile,
  UserRepository,
} from "@domain/repositories/user.repository";

const DEMO_CODE = "123456";

export class MockUserRepository implements UserRepository {
  private profile: UserProfile | null = null;
  private lastEmail = "";

  async requestOtp(email: string): Promise<void> {
    this.lastEmail = email;
  }

  async verifyOtp(email: string, code: string): Promise<AuthSession> {
    if (code !== DEMO_CODE) {
      throw new Error("MockUserRepository: invalid OTP");
    }
    const isNew = this.profile === null;
    if (isNew) {
      this.profile = {
        emailMasked: maskEmail(email),
        hasNik: false,
      };
    }
    return { token: `tok-${email}`, isNew };
  }

  async completeRegistration(input: {
    fullName: string;
    nik: string;
  }): Promise<UserProfile> {
    this.profile = {
      emailMasked: maskEmail(this.lastEmail),
      fullName: input.fullName,
      nikMasked: `${input.nik.slice(0, 2)}****${input.nik.slice(-2)}`,
      hasNik: true,
    };
    return this.profile;
  }

  async getMe(): Promise<UserProfile> {
    if (!this.profile) {
      throw new Error("MockUserRepository: not signed in");
    }
    return this.profile;
  }
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return "****";
  return `${name.slice(0, 1)}***@${domain}`;
}
