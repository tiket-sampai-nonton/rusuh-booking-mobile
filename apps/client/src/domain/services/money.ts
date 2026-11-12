/**
 * Money formatting — pure domain service (framework-free).
 *
 * Amount values cross the current API contract as whole Rupiah even where the
 * field name ends in `Minor` (for example, 275000 means Rp 275.000). Do not
 * apply a 100x minor-unit conversion: IDR has no sub-unit in the product data.
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
 * Format an API IDR amount as a display string, e.g. `275000` →
 * `"Rp 275.000"`. A nullish amount renders `"Rp 0"`. Keep full values
 * consistent across platforms and screens.
 */
export function minorToIDR(amountMinor: number | null | undefined): string {
  const amount =
    typeof amountMinor === "number" && Number.isFinite(amountMinor)
      ? amountMinor
      : 0;
  const rupiah = Math.trunc(amount);
  const sign = rupiah < 0 ? "-" : "";
  const abs = Math.abs(rupiah);

  return `${sign}Rp ${groupThousands(abs)}`;
}
