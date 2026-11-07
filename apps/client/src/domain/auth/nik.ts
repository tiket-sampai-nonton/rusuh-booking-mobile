/**
 * NIK validator — domain rule (RBT-021, E3, pure TS).
 *
 * NIK = Indonesian ID (Nomor Induk Kependudukan): exactly 16 numeric digits.
 * This is the FE-side plausibility gate mirroring the prototype (`#lgRegNik`,
 * api.js `/^[0-9]{16}$/`): length + numeric only. The backend validates NIK
 * authoritatively; structural plausibility beyond length/numeric is a BE
 * concern, so the FE rule stays deliberately simple to avoid false rejects.
 *
 * SECURITY (SECURITY.md): this validator NEVER logs or persists the raw NIK.
 * It only returns an ok/reason verdict. The raw NIK is passed straight to the
 * port for the BE; the FE only ever receives a MASKED NIK back.
 *
 * Pure: no React / RN / Expo / infrastructure imports, no side effects.
 */

/** The canonical NIK length (digits). */
export const NIK_LENGTH = 16;

/** Prototype NIK error copy (api.js `NIK_INVALID`). */
export const NIK_ERROR = `NIK harus ${NIK_LENGTH} digit angka sesuai KTP.`;

/** Validation verdict. `reason` is a Bahasa, UI-safe message when `ok` is false. */
export interface NikVerdict {
  readonly ok: boolean;
  readonly reason?: string;
}

/**
 * Validate a NIK: exactly {@link NIK_LENGTH} numeric digits after trimming.
 *
 * Returns `{ ok: true }` when valid, else `{ ok: false, reason }`. Does NOT
 * mutate, log, or persist the input (SECURITY).
 */
export function validateNik(raw: string): NikVerdict {
  const value = raw.trim();
  if (value.length === 0) {
    return { ok: false, reason: NIK_ERROR };
  }
  if (!/^[0-9]+$/.test(value)) {
    return { ok: false, reason: NIK_ERROR };
  }
  if (value.length !== NIK_LENGTH) {
    return { ok: false, reason: NIK_ERROR };
  }
  return { ok: true };
}
