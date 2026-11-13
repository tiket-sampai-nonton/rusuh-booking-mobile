/**
 * Browse filter logic — pure, framework-free (RBT-031).
 *
 * URL query values are normalized here and sent to the server by Browse. This
 * module keeps the mock fallback pure. Genre values follow the backend contract.
 */
import type { EventSummary } from "@domain/repositories/event.repository";
import { inTimeBucket } from "@domain/rules/catalog-time-window";
export { inTimeBucket } from "@domain/rules/catalog-time-window";

export const TIMES = ["all", "week", "month", "quarter"] as const;
export const SORTS = ["closest", "furthest"] as const;

/**
 * Any non-empty query is noindex while the canonical URL remains `/browse`.
 */
type BrowseQueryValue = string | string[] | undefined;
type BrowseQueryParams = Readonly<Record<string, BrowseQueryValue>>;

export function hasBrowseQueryParams(params: BrowseQueryParams): boolean {
  return Object.values(params).some((value) =>
    Array.isArray(value)
      ? value.some((item) => item.trim().length > 0)
      : typeof value === "string" && value.trim().length > 0,
  );
}

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
 * Normalize a user-supplied URL genre in the same form used by the backend.
 */
export function readGenre(v: string | string[] | undefined): string {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s || ["semua", "all"].includes(s.trim().toLowerCase())) return "Semua";
  return s
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
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
    list = list.filter((ev) =>
      ev.genres?.some((value) => value.toLowerCase() === genre.toLowerCase()),
    );
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
