/**
 * Money formatting — pure domain service (framework-free).
 *
 * Amounts cross the contract as integer MINOR units of IDR (Rupiah has no
 * sub-unit in practice, but the BE models money in minor units for consistency,
 * so 45_000_000 minor = Rp 450.000). Mirrors the prototype's `API.minorToIDR`.
 *
 * No React / RN / Expo / Intl-locale dependency: the grouping is done by hand so
 * the output is identical on every platform (RN Android has historically shipped
 * a stubbed `Intl`).
 */

/** Group an integer's digits with a dot every three places: 450000 → "450.000". */
function groupThousands(nInteger: number): string {
  const digits = Math.abs(Math.trunc(nInteger)).toString();
  let out = "";
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ".";
    out += digits[i];
  }
  return out;
}

/**
 * Format a minor-unit IDR amount as a display string, e.g. `45000000` →
 * `"Rp 450.000"`. A nullish amount renders `"Rp 0"` (defensive — the catalog may
 * carry an unpriced event). The minor→major divisor is 100.
 */
export function minorToIDR(amountMinor: number | null | undefined): string {
  const minor = typeof amountMinor === "number" && isFinite(amountMinor) ? amountMinor : 0;
  const major = Math.trunc(minor / 100);
  const sign = major < 0 ? "-" : "";
  return `${sign}Rp ${groupThousands(major)}`;
}
