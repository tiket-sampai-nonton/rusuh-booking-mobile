/**
 * Date formatting — pure domain service (framework-free).
 *
 * Indonesian short-date `DD MMM YYYY` (e.g. `01 Des 2026`), mirroring the
 * prototype's `fmtDateID`. No `Intl`/locale dependency so the output is
 * deterministic across web + native and in tests.
 */

/** Indonesian abbreviated month names, Jan..Des (index 0..11). */
export const ID_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Format an ISO-8601 timestamp as `DD MMM YYYY` in Indonesian month names.
 * Returns `""` for a missing/invalid date so a caller can render a dash.
 */
export function formatDateID(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const ms = d.getTime();
  if (!Number.isFinite(ms)) return "";
  const dd = d.getUTCDate().toString().padStart(2, "0");
  const mmm = ID_MONTHS[d.getUTCMonth()];
  const yyyy = d.getUTCFullYear();
  return `${dd} ${mmm} ${yyyy}`;
}

/** Format the clock part as `HH:MM WIB` (UTC-based, deterministic). "" if invalid. */
export function formatTimeID(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const hh = d.getUTCHours().toString().padStart(2, "0");
  const mm = d.getUTCMinutes().toString().padStart(2, "0");
  return `${hh}:${mm} WIB`;
}

/** Format an ISO timestamp in the WIB time zone for ticket/event display. */
export function formatWIBDateID(iso: string | null | undefined): string {
  if (!iso) return "";
  const timestamp = Date.parse(iso);
  if (!Number.isFinite(timestamp)) return "";
  const date = new Date(timestamp + WIB_OFFSET_MS);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = ID_MONTHS[date.getUTCMonth()];
  return `${day} ${month} ${date.getUTCFullYear()}`;
}

/** Format an ISO timestamp clock time as `HH:MM WIB`. */
export function formatWIBTimeID(iso: string | null | undefined): string {
  if (!iso) return "";
  const timestamp = Date.parse(iso);
  if (!Number.isFinite(timestamp)) return "";
  const date = new Date(timestamp + WIB_OFFSET_MS);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes} WIB`;
}

/** Format a milliseconds-remaining value as `MM:SS` (for payment/booking timers). */
export function formatCountdown(remainingMs: number): string {
  const totalSec = Math.max(0, Math.floor(remainingMs / 1000));
  const mm = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}
