/**
 * Lightweight validators for the OTP sign-in forms (RBT-020).
 *
 * Dependency-free (no zod / react-hook-form): the two checks are trivial -- a
 * well-formed email and an exactly-6-digit code -- so the modal validates inline
 * and surfaces the prototype's Bahasa copy directly. Copy is VERBATIM from
 * `.genesis/prototype/Final/index.html`: an invalid email shows
 * 'Format email belum benar'.
 */

/** Prototype email error copy. */
export const EMAIL_ERROR = "Format email belum benar";

/**
 * Pragmatic email check -- mirrors the prototype's `emailOk` (a non-empty local
 * part, an `@`, a dotted domain). Trims first.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** The OTP is exactly 6 digits. */
export function isValidCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

/** Keep only digits, capped at 6 (mirrors the prototype input handler). */
export function normalizeCode(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 6);
}
