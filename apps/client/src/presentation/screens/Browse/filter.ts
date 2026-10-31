/**
 * Browse filter logic — pure, framework-free. Reads/normalizes the URL filter
 * params and filters+sorts the catalog client-side (O4 open blocker). genre is
 * an O1 FE-NEED gap (EventSummary has no genre), so it is a best-effort name
 * match until the field lands; time + sort work fully off startsAt.
 */
import type { EventSummary } from "@domain/repositories/event.repository";

export const GENRES = ["Semua", "Festival", "Jazz", "Rock", "Elektronik", "Folk", "Orkestra"] as const;
export const TIMES = ["all", "week", "month", "quarter"] as const;
export const SORTS = ["closest", "furthest"] as const;

export const TIME_LABEL: Record<string, string> = {
  all: "Semua waktu",
  week: "Minggu ini",
  month: "Bulan ini",
  quarter: "3 Bulan",
};
export const SORT_LABEL: Record<string, string> = { closest: "Terdekat", furthest: "Terjauh" };

const DAY = 86_400_000;

/** URL params are user-controlled — normalize unknown values to safe defaults. */
export function readParam(
  v: string | string[] | undefined,
  valid: readonly string[],
  fallback: string,
): string {
  const s = Array.isArray(v) ? v[0] : v;
  return s && valid.includes(s) ? s : fallback;
}

export function inTimeBucket(ev: EventSummary, time: string, now: number): boolean {
  if (time === "all") return true;
  const t = ev.startsAt ? new Date(ev.startsAt).getTime() : NaN;
  if (!Number.isFinite(t)) return false;
  if (time === "week") return t >= now && t <= now + 7 * DAY;
  if (time === "month") return t >= now && t <= now + 30 * DAY;
  if (time === "quarter") return t >= now && t <= now + 90 * DAY;
  return true;
}

export function filterEvents(
  all: readonly EventSummary[],
  genre: string,
  time: string,
  sort: string,
  now: number,
): EventSummary[] {
  let list = all.filter((ev) => inTimeBucket(ev, time, now));
  if (genre !== "Semua") {
    list = list.filter((ev) => ev.name.toLowerCase().includes(genre.toLowerCase()));
  }
  const dir = sort === "furthest" ? -1 : 1;
  return [...list].sort((a, b) => {
    const ta = a.startsAt ? new Date(a.startsAt).getTime() : 0;
    const tb = b.startsAt ? new Date(b.startsAt).getTime() : 0;
    return (ta - tb) * dir;
  });
}

export function isFiltered(genre: string, time: string, sort: string): boolean {
  return genre !== "Semua" || time !== "all" || sort !== "closest";
}
