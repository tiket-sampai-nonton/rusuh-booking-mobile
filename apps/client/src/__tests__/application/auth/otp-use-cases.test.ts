/**
 * RBT-020 — unit tests for the auth OTP use cases (RED-first, TDD).
 *
 * Pure-TS tests with a FAKE UserRepository (no framework, no DI container).
 * Assert that:
 *   - RequestOtp calls the port with the given email.
 *   - VerifyOtp returns the AuthSession ({ token, isNew }) the port yields.
 *   - A wrong OTP surfaces as a domain-meaningful DomainError (kind "auth",
 *     code OTP_INVALID) — never a raw transport Error leaking out.
 *   - A returning user (isNew=false) flows through untouched.
 */
import { RequestOtp } from "@application/auth/request-otp.use-case";
import { VerifyOtp } from "@application/auth/verify-otp.use-case";
import { DomainError } from "@domain/errors/domain-error";
import type {
  AuthSession,
  UserProfile,
  UserRepository,
} from "@domain/repositories/user.repository";

/** Minimal in-memory fake of the UserRepository port (TDD double). */
class FakeUserRepository implements UserRepository {
  readonly requestedEmails: string[] = [];
  readonly verifyCalls: { email: string; code: string }[] = [];
  /** When set, verifyOtp resolves with this session; else it rejects. */
  nextSession: AuthSession | null = { token: "tok-1", isNew: true };
  /** Error verifyOtp throws when nextSession is null (simulates wrong code). */
  verifyError: Error = new Error("invalid OTP");

  async requestOtp(email: string): Promise<void> {
    this.requestedEmails.push(email);
  }

  async verifyOtp(email: string, code: string): Promise<AuthSession> {
    this.verifyCalls.push({ email, code });
    if (this.nextSession === null) {
      throw this.verifyError;
    }
    return this.nextSession;
  }

  async completeRegistration(): Promise<UserProfile> {
    return { emailMasked: "a***@b.com", hasNik: true };
  }

  async getMe(): Promise<UserProfile> {
    return { emailMasked: "a***@b.com", hasNik: false };
  }
}

describe("application/auth — RequestOtp", () => {
  it("calls the port with the email and resolves void", async () => {
    const repo = new FakeUserRepository();
    const useCase = new RequestOtp(repo);

    const result = await useCase.execute("rizky@example.com");

    expect(result).toBeUndefined();
    expect(repo.requestedEmails).toEqual(["rizky@example.com"]);
  });

  it("trims surrounding whitespace before hitting the port", async () => {
    const repo = new FakeUserRepository();
    const useCase = new RequestOtp(repo);

    await useCase.execute("  spaced@example.com  ");

    expect(repo.requestedEmails).toEqual(["spaced@example.com"]);
  });
});

describe("application/auth — VerifyOtp", () => {
  it("returns the AuthSession the port yields for a new account", async () => {
    const repo = new FakeUserRepository();
    repo.nextSession = { token: "tok-new", isNew: true };
    const useCase = new VerifyOtp(repo);

    const session = await useCase.execute("rizky@example.com", "123456");

    expect(session).toEqual({ token: "tok-new", isNew: true });
    expect(repo.verifyCalls).toEqual([
      { email: "rizky@example.com", code: "123456" },
    ]);
  });

  it("returns isNew=false for a returning user", async () => {
    const repo = new FakeUserRepository();
    repo.nextSession = { token: "tok-ret", isNew: false };
    const useCase = new VerifyOtp(repo);

    const session = await useCase.execute("returning@example.com", "123456");

    expect(session.isNew).toBe(false);
    expect(session.token).toBe("tok-ret");
  });

  it("trims the email and strips non-digits from the code before verifying", async () => {
    const repo = new FakeUserRepository();
    repo.nextSession = { token: "tok", isNew: true };
    const useCase = new VerifyOtp(repo);

    await useCase.execute("  rizky@example.com ", "1 2-3 4 5 6");

    expect(repo.verifyCalls).toEqual([
      { email: "rizky@example.com", code: "123456" },
    ]);
  });

  it("surfaces a wrong OTP as a DomainError(kind=auth, code=OTP_INVALID)", async () => {
    const repo = new FakeUserRepository();
    repo.nextSession = null; // force verifyOtp to reject
    const useCase = new VerifyOtp(repo);

    const err = await useCase.execute("a@b.com", "000000").catch((e) => e);

    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).kind).toBe("auth");
    expect((err as DomainError).code).toBe("OTP_INVALID");
    expect((err as DomainError).userMessage.length).toBeGreaterThan(0);
  });

  it("passes an already-typed DomainError through unchanged", async () => {
    const repo = new FakeUserRepository();
    repo.nextSession = null;
    repo.verifyError = new DomainError({
      kind: "rate_limited",
      code: "OTP_LOCKED",
      userMessage: "Terlalu banyak percobaan OTP.",
    });
    const useCase = new VerifyOtp(repo);

    const err = await useCase.execute("a@b.com", "000000").catch((e) => e);

    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe("OTP_LOCKED");
    expect((err as DomainError).kind).toBe("rate_limited");
  });
});
