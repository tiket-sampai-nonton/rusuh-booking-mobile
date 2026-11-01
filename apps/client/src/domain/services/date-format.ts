/**
 * Date formatting — pure domain service (framework-free).
 *
 * Indonesian short-date `DD-MMM-YYYY` (e.g. `01-Des-2026`), mirroring the
 * prototype's `fmtDateID`. No `Intl`/locale dependency so the output is
 * deterministic across web + native and in tests.
 */

/** Indonesian abbreviated month names, Jan..Des (index 0..11). */
export const ID_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
] as const;

/**
 * Format an ISO-8601 timestamp as `DD-MMM-YYYY` in Indonesian month names.
 * Returns `""` for a missing/invalid date so a caller can render a dash.
 */
export function formatDateID(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const ms = d.getTime();
  if (!isFinite(ms)) return "";
  const dd = d.getUTCDate().toString().padStart(2, "0");
  const mmm = ID_MONTHS[d.getUTCMonth()];
  const yyyy = d.getUTCFullYear();
  return `${dd}-${mmm}-${yyyy}`;
}

/** Format the clock part as `HH:MM WIB` (UTC-based, deterministic). "" if invalid. */
export function formatTimeID(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!isFinite(d.getTime())) return "";
  const hh = d.getUTCHours().toString().padStart(2, "0");
  const mm = d.getUTCMinutes().toString().padStart(2, "0");
  return `${hh}:${mm} WIB`;
}

/** Format a milliseconds-remaining value as `MM:SS` (for payment/booking timers). */
export function formatCountdown(remainingMs: number): string {
  const totalSec = Math.max(0, Math.floor(remainingMs / 1000));
  const mm = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}
