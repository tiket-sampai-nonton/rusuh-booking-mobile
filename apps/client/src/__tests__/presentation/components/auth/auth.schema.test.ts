import { EMAIL_ERROR, isValidCode, isValidEmail, normalizeCode } from "../../../../presentation/components/auth/auth.schema";

describe("OTP form validators", () => {
  it("trims and validates email addresses", () => {
    expect(isValidEmail("  tiket@example.co.id  ")).toBe(true);
    expect(isValidEmail("missing-at.example.com")).toBe(false);
    expect(EMAIL_ERROR).toBe("Format email belum benar");
  });

  it("requires exactly six digits after trimming", () => {
    expect(isValidCode(" 123456 ")).toBe(true);
    expect(isValidCode("12345")).toBe(false);
    expect(isValidCode("12345x")).toBe(false);
  });

  it("normalizes pasted OTP values to six digits", () => {
    expect(normalizeCode("12-3a45678")).toBe("123456");
    expect(normalizeCode("a-b")).toBe("");
  });
});
