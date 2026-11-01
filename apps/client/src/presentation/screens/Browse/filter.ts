/**
 * Browse filter logic — pure, framework-free (RBT-031).
 *
 * The URL query string (genre/time/sort) is the single source of truth for the
 * Browse results. This module reads + normalizes those user-controlled params
 * and filters/sorts the already-fetched catalog client-side (O4 open blocker:
 * GET /events has no server filter param yet). No React / RN / Expo imports.
 *
 * genre is an O1 FE-NEED gap — `EventSummary` carries no genre field — so it is
 * a best-effort name-substring match until the field lands; time + sort work
 * fully off `startsAt`.
 */
import type { EventSummary } from "@domain/repositories/event.repository";

/** Genre chips (prototype browse.html select). "Semua" = no genre filter. */
export const GENRES = [
  "Semua",
  "Festival",
  "Jazz",
  "Rock",
  "Elektronik",
  "Folk",
  "Orkestra",
] as const;
export const TIMES = ["all", "week", "month", "quarter"] as const;
export const SORTS = ["closest", "furthest"] as const;

export const TIME_LABEL: Record<string, string> = {
  all: "Semua waktu",
  week: "Minggu ini",
  month: "Bulan ini",
  quarter: "3 Bulan",
};
export const SORT_LABEL: Record<string, string> = {
  closest: "Terdekat",
  furthest: "Terjauh",
};

const DAY = 86_400_000;

/**
 * URL params are user-controlled — normalize unknown/tampered values to the
 * safe default instead of turning a typo into a false empty state.
 */
export function readParam(
  v: string | string[] | undefined,
  valid: readonly string[],
  fallback: string,
): string {
  const s = Array.isArray(v) ? v[0] : v;
  return s && valid.includes(s) ? s : fallback;
}

/**
 * Read the genre param case-insensitively. Home navigates with lowercase slugs
 * (e.g. /browse?genre=rock) while the chips/filter use the canonical capitalized
 * form ("Rock"); match by lowercase so a deep link still filters correctly, and
 * return the canonical casing for display. Unknown → "Semua".
 */
export function readGenre(v: string | string[] | undefined): string {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s) return "Semua";
  const hit = GENRES.find((g) => g.toLowerCase() === s.toLowerCase());
  return hit ?? "Semua";
}

/** True when `ev` starts inside the selected time window (from `now`). */
export function inTimeBucket(
  ev: Pick<EventSummary, "startsAt">,
  time: string,
  now: number,
): boolean {
  if (time === "all") return true;
  const t = ev.startsAt ? new Date(ev.startsAt).getTime() : NaN;
  if (!Number.isFinite(t)) return false;
  if (time === "week") return t >= now && t <= now + 7 * DAY;
  if (time === "month") return t >= now && t <= now + 30 * DAY;
  if (time === "quarter") return t >= now && t <= now + 90 * DAY;
  return true;
}

/**
 * Filter + sort the catalog by the URL dimensions. Pure: returns a new array,
 * never mutates the input.
 */
export function filterEvents(
  all: readonly EventSummary[],
  genre: string,
  time: string,
  sort: string,
  now: number,
): EventSummary[] {
  let list = all.filter((ev) => inTimeBucket(ev, time, now));
  if (genre !== "Semua") {
    const needle = genre.toLowerCase();
    list = list.filter((ev) => ev.name.toLowerCase().includes(needle));
  }
  const dir = sort === "furthest" ? -1 : 1;
  return [...list].sort((a, b) => {
    const ta = a.startsAt ? new Date(a.startsAt).getTime() : 0;
    const tb = b.startsAt ? new Date(b.startsAt).getTime() : 0;
    return (ta - tb) * dir;
  });
}

/** True when any dimension is non-default (drives the Reset Filter chip). */
export function isFiltered(genre: string, time: string, sort: string): boolean {
  return genre !== "Semua" || time !== "all" || sort !== "closest";
}
