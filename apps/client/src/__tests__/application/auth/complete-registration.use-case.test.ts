/**
 * RBT-021 — CompleteRegistration use-case unit tests (pure TS).
 *
 * Against a FAKE UserRepository (no React/RN). Asserts:
 *  - the full name is TRIMMED before delegating to the port,
 *  - an invalid NIK is rejected locally (DomainError NIK_INVALID) WITHOUT
 *    calling the port (defense-in-depth; BE validates authoritatively),
 *  - an empty/whitespace name is rejected locally without calling the port,
 *  - the masked UserProfile from the port is returned on success,
 *  - a typed DomainError from the port passes through untouched,
 *  - a non-typed port failure is mapped to a DomainError.
 */
import { CompleteRegistration } from "@application/auth/complete-registration.use-case";
import { DomainError } from "@domain/errors/domain-error";
import type {
  AuthSession,
  UserProfile,
  UserRepository,
} from "@domain/repositories/user.repository";

class FakeUserRepository implements UserRepository {
  public calls: { fullName: string; nik: string }[] = [];
  public nextProfile: UserProfile = {
    emailMasked: "r***@telkomsel.co.id",
    fullName: "Rizky",
    nikMasked: "32****23",
    hasNik: true,
  };
  public registerError: Error | null = null;

  async requestOtp(): Promise<void> {}
  async verifyOtp(): Promise<AuthSession> {
    return { token: "tok", isNew: true };
  }
  async completeRegistration(input: {
    fullName: string;
    nik: string;
  }): Promise<UserProfile> {
    this.calls.push(input);
    if (this.registerError) throw this.registerError;
    return this.nextProfile;
  }
  async getMe(): Promise<UserProfile> {
    return this.nextProfile;
  }
  async getCheckoutDetails() {
    return { email: "test@example.com" };
  }
}

const VALID_NIK = "3201234567890123";

describe("CompleteRegistration", () => {
  it("trims the name and passes the NIK to the port, returning the profile", async () => {
    const repo = new FakeUserRepository();
    const profile = await new CompleteRegistration(repo).execute({
      fullName: "  Rizky Rachmawan  ",
      nik: VALID_NIK,
    });
    expect(repo.calls).toEqual([
      { fullName: "Rizky Rachmawan", nik: VALID_NIK },
    ]);
    expect(profile).toEqual(repo.nextProfile);
  });

  it("trims the NIK before delegating", async () => {
    const repo = new FakeUserRepository();
    await new CompleteRegistration(repo).execute({
      fullName: "Rizky",
      nik: `  ${VALID_NIK}  `,
    });
    expect(repo.calls[0].nik).toBe(VALID_NIK);
  });

  it("rejects an invalid NIK locally (NIK_INVALID) WITHOUT calling the port", async () => {
    const repo = new FakeUserRepository();
    await expect(
      new CompleteRegistration(repo).execute({
        fullName: "Rizky",
        nik: "123",
      }),
    ).rejects.toMatchObject({ name: "DomainError", code: "NIK_INVALID" });
    expect(repo.calls).toEqual([]);
  });

  it("rejects a non-numeric NIK locally without calling the port", async () => {
    const repo = new FakeUserRepository();
    await expect(
      new CompleteRegistration(repo).execute({
        fullName: "Rizky",
        nik: "3201abcd67890123",
      }),
    ).rejects.toMatchObject({ code: "NIK_INVALID" });
    expect(repo.calls).toEqual([]);
  });

  it("rejects an empty/whitespace name locally without calling the port", async () => {
    const repo = new FakeUserRepository();
    await expect(
      new CompleteRegistration(repo).execute({
        fullName: "   ",
        nik: VALID_NIK,
      }),
    ).rejects.toMatchObject({ name: "DomainError", code: "VALIDATION_ERROR" });
    expect(repo.calls).toEqual([]);
  });

  it("passes a typed DomainError from the port through untouched", async () => {
    const repo = new FakeUserRepository();
    const typed = new DomainError({
      kind: "conflict",
      code: "NIK_ALREADY_LINKED",
      userMessage: "NIK sudah tertaut ke akun lain.",
    });
    repo.registerError = typed;
    await expect(
      new CompleteRegistration(repo).execute({
        fullName: "Rizky",
        nik: VALID_NIK,
      }),
    ).rejects.toBe(typed);
  });

  it("maps a non-typed port failure to a DomainError", async () => {
    const repo = new FakeUserRepository();
    repo.registerError = new Error("boom");
    await expect(
      new CompleteRegistration(repo).execute({
        fullName: "Rizky",
        nik: VALID_NIK,
      }),
    ).rejects.toMatchObject({ name: "DomainError" });
  });
});
