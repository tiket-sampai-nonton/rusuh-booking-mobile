import { DomainError } from "@domain/errors/domain-error";
import { profileUpdateErrorMessage } from "@presentation/screens/Profile";

jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe("profile update error copy", () => {
  it("prefers a domain message, then an Error message, then the safe fallback", () => {
    const domainError = new DomainError({ kind: "auth", code: "OTP_FAILED", userMessage: "Periksa data profil." });
    expect(profileUpdateErrorMessage(domainError)).toBe("Periksa data profil.");
    expect(profileUpdateErrorMessage(new Error("Tidak dapat menyimpan."))).toBe("Tidak dapat menyimpan.");
    expect(profileUpdateErrorMessage("unknown failure")).toBe("Profil gagal diperbarui.");
  });
});
