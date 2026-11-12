/**
 * RBT-020 — auth use-case unit tests (RequestOtp / VerifyOtp).
 *
 * Pure-TS tests against a FAKE UserRepository (no React/RN). They assert input
 * normalization, the isNew passthrough, and the typed-error mapping on failure.
 */
import { RequestOtp } from "@application/auth/request-otp.use-case";
import { VerifyOtp } from "@application/auth/verify-otp.use-case";
import { DomainError } from "@domain/errors/domain-error";
import type {
  AuthSession,
  UserProfile,
  UserRepository,
} from "@domain/repositories/user.repository";

class FakeUserRepository implements UserRepository {
  public requestedEmails: string[] = [];
  public verifyCalls: { email: string; code: string }[] = [];
  public nextSession: AuthSession = { token: "tok-x", isNew: false };
  public verifyError: Error | null = null;

  async requestOtp(email: string): Promise<void> {
    this.requestedEmails.push(email);
  }
  async verifyOtp(email: string, code: string): Promise<AuthSession> {
    this.verifyCalls.push({ email, code });
    if (this.verifyError) throw this.verifyError;
    return this.nextSession;
  }
  async completeRegistration(): Promise<UserProfile> {
    return { emailMasked: "t***@x.com", hasNik: true };
  }
  async getMe(): Promise<UserProfile> {
    return { emailMasked: "t***@x.com", hasNik: false };
  }
  async getCheckoutDetails() {
    return { email: "test@example.com" };
  }
}

describe("RequestOtp", () => {
  it("trims the email before delegating to the port", async () => {
    const repo = new FakeUserRepository();
    await new RequestOtp(repo).execute("  Kamu@Email.com  ");
    expect(repo.requestedEmails).toEqual(["Kamu@Email.com"]);
  });
});

describe("VerifyOtp", () => {
  it("normalizes email+code and returns the session (isNew=false)", async () => {
    const repo = new FakeUserRepository();
    repo.nextSession = { token: "tok-1", isNew: false };
    const session = await new VerifyOtp(repo).execute(
      " a@b.com ",
      "1 2-3x4 5 6",
    );
    expect(repo.verifyCalls).toEqual([{ email: "a@b.com", code: "123456" }]);
    expect(session).toEqual({ token: "tok-1", isNew: false });
  });

  it("passes through isNew=true for a new account", async () => {
    const repo = new FakeUserRepository();
    repo.nextSession = { token: "tok-new", isNew: true };
    const session = await new VerifyOtp(repo).execute("new@x.com", "123456");
    expect(session.isNew).toBe(true);
  });

  it("maps a non-typed failure to a DomainError (OTP_INVALID)", async () => {
    const repo = new FakeUserRepository();
    repo.verifyError = new Error("boom"); // e.g. mock's "invalid OTP"
    await expect(
      new VerifyOtp(repo).execute("a@b.com", "000000"),
    ).rejects.toMatchObject({
      name: "DomainError",
      kind: "auth",
      code: "OTP_INVALID",
    });
  });

  it("passes a typed DomainError through untouched", async () => {
    const repo = new FakeUserRepository();
    const typed = new DomainError({
      kind: "rate_limited",
      code: "OTP_LOCKED",
      userMessage: "locked",
    });
    repo.verifyError = typed;
    await expect(new VerifyOtp(repo).execute("a@b.com", "123456")).rejects.toBe(
      typed,
    );
  });
});
