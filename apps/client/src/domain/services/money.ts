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

export interface MoneyOptions {
  /**
   * Compact card label (prototype `minorToIDR({compact:true})`): a major-unit
   * value ≥ 1.000.000 renders as "Rp 1,2jt", ≥ 1.000 as "Rp 450rb". Used on the
   * catalog card price tag; the full grouped form is used everywhere else.
   */
  readonly compact?: boolean;
}

/**
 * Format a minor-unit IDR amount as a display string, e.g. `45000000` →
 * `"Rp 450.000"` (or `"Rp 450rb"` with `{compact:true}`). A nullish amount
 * renders `"Rp 0"`. The minor→major divisor is 100.
 */
export function minorToIDR(
  amountMinor: number | null | undefined,
  opts: MoneyOptions = {},
): string {
  const minor =
    typeof amountMinor === "number" && isFinite(amountMinor) ? amountMinor : 0;
  const major = Math.trunc(minor / 100);
  const sign = major < 0 ? "-" : "";
  const abs = Math.abs(major);

  if (opts.compact && abs >= 1000) {
    if (abs >= 1_000_000) {
      // "Rp 1,2jt" — Indonesian decimal comma, 1 fraction digit, trailing 0 cut.
      const jt = abs / 1_000_000;
      const txt = jt
        .toFixed(1)
        .replace(/\.0$/, "")
        .replace(".", ",");
      return `${sign}Rp ${txt}jt`;
    }
    return `${sign}Rp ${Math.round(abs / 1000)}rb`;
  }
  return `${sign}Rp ${groupThousands(abs)}`;
}
