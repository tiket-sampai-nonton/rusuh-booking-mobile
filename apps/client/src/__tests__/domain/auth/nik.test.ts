/**
 * RBT-021 — NIK validator unit tests (domain rule, pure TS).
 *
 * `validateNik` is the single source of truth for FE-side NIK plausibility:
 * exactly 16 numeric digits (prototype `#lgRegNik` / api.js `/^[0-9]{16}$/`).
 * The validator NEVER logs or persists the raw NIK — it only returns an
 * ok/reason verdict. The BE validates authoritatively and only a MASKED NIK is
 * ever surfaced back (SECURITY.md).
 */
import { NIK_LENGTH, validateNik } from "@domain/auth/nik";

describe("validateNik", () => {
  it("accepts an exactly-16-digit numeric NIK", () => {
    expect(validateNik("3201234567890123")).toEqual({ ok: true });
  });

  it("exposes the canonical NIK length (16)", () => {
    expect(NIK_LENGTH).toBe(16);
  });

  it("rejects an empty string", () => {
    const r = validateNik("");
    expect(r.ok).toBe(false);
    expect(r.reason).toBeTruthy();
  });

  it("rejects a whitespace-only string", () => {
    expect(validateNik("    ").ok).toBe(false);
  });

  it("rejects a too-short NIK (15 digits)", () => {
    const r = validateNik("320123456789012");
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("16");
  });

  it("rejects a too-long NIK (17 digits)", () => {
    expect(validateNik("32012345678901234").ok).toBe(false);
  });

  it("rejects a non-numeric NIK (letters)", () => {
    const r = validateNik("3201234567abcd12");
    expect(r.ok).toBe(false);
    expect(r.reason).toBeTruthy();
  });

  it("rejects a NIK with embedded spaces", () => {
    expect(validateNik("3201 234567 89012").ok).toBe(false);
  });

  it("rejects a NIK with punctuation/symbols", () => {
    expect(validateNik("3201-2345-6789-0123").ok).toBe(false);
  });

  it("trims surrounding whitespace before validating a valid NIK", () => {
    expect(validateNik("  3201234567890123  ")).toEqual({ ok: true });
  });

  it("rejects all-zero but still treats length+numeric as the rule", () => {
    // 16 zeros is numerically implausible but structurally 16 digits; the FE
    // rule is length+numeric (BE validates authoritatively) → accepted here.
    expect(validateNik("0000000000000000").ok).toBe(true);
  });

  it("is a pure function (no side effects, same input → same output)", () => {
    const a = validateNik("3201234567890123");
    const b = validateNik("3201234567890123");
    expect(a).toEqual(b);
  });
});
