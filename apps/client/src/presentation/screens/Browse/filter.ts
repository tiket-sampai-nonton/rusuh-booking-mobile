/**
 * Browse filter logic — pure, framework-free (RBT-031).
 *
 * URL query values are normalized here and sent to the server by Browse. This
 * module keeps the small category-chip filtering and mock fallback pure. No
 * React / RN / Expo imports. The public contract now supplies genres, although
 * category labels in the UI are mapped to backend genre values by the screen
 * and refined client-side for category chips.
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

/**
 * Query-result pages are client-filtered and have no dedicated static HTML.
 * Until server-backed filters land, any non-empty query is noindex while the
 * Seo component keeps its canonical URL at `/browse`.
 */
export function hasBrowseQueryParams(
  params: Readonly<Record<string, string | string[] | undefined>>,
): boolean {
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

const DAY = 86_400_000;

const CATEGORY_TERMS: Readonly<Record<string, readonly string[]>> = {
  concert: ["concert", "konser"],
  festival: ["festival", "fest"],
  sports: ["sports", "sport", "olahraga"],
  theater: ["theater", "theatre", "teater"],
};

/** Best-effort category match until EventSummary receives a typed genre field. */
export function matchesCategory(
  event: Pick<EventSummary, "name" | "venue"> &
    Partial<Pick<EventSummary, "genres">>,
  category: string,
): boolean {
  const terms = CATEGORY_TERMS[category.toLowerCase()] ?? [
    category.toLowerCase(),
  ];
  const searchable = `${event.name} ${event.venue ?? ""}`.toLowerCase();
  return terms.some(
    (term) =>
      searchable.includes(term) ||
      event.genres?.some((genre) => genre.toLowerCase() === term),
  );
}

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
  return hit ?? s;
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
    list = list.filter((ev) => matchesCategory(ev, genre));
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
