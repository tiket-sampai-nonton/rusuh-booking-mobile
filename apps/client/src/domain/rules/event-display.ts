/**
 * Event display rules — pure domain (framework-free).
 *
 * Maps a contract `EventStatus` (+ remainingTickets) to the badge the catalog
 * renders, and derives the "upcoming vs history" split. Mirrors the prototype's
 * badge logic (index.html): AVAILABLE + plenty → "Tersedia"; AVAILABLE + low
 * stock → "Stok Menipis"; SOLD_OUT → disabled "Sold Out"; NOT_STARTED →
 * "Segera"; CLOSED / past → history.
 *
 * Status is NEVER color-only (RBT-080 / WCAG): every badge carries a text label
 * AND a semantic `tone` the UI pairs with an icon, so the presentation layer can
 * satisfy "status not conveyed by color alone".
 */
import type {
  EventStatus,
  EventSummary,
} from "@domain/repositories/event.repository";

/** Low-stock threshold — below this a still-AVAILABLE event reads "Stok Menipis". */
export const LOW_STOCK_THRESHOLD = 200;

/** Semantic tone for a badge — drives both color and the paired icon/label. */
export type BadgeTone = "ok" | "low" | "soon" | "soldout" | "done";

export interface EventBadge {
  readonly tone: BadgeTone;
  /** User-facing Bahasa label. */
  readonly label: string;
  /** True when the event cannot be entered (card disabled). */
  readonly disabled: boolean;
}

/**
 * Resolve the display badge for an event. `remainingTickets` is FE-NEED (O1),
 * optional — when absent an AVAILABLE event defaults to "Tersedia".
 */
export function badgeFor(event: {
  status: EventStatus;
  remainingTickets?: number;
}): EventBadge {
  switch (event.status) {
    case "SOLD_OUT":
      return { tone: "soldout", label: "Sold Out", disabled: true };
    case "CLOSED":
      return { tone: "done", label: "Selesai", disabled: true };
    case "NOT_STARTED":
      return { tone: "soon", label: "Segera", disabled: false };
    case "AVAILABLE": {
      const remaining = event.remainingTickets;
      if (typeof remaining === "number" && remaining <= 0) {
        return { tone: "soldout", label: "Sold Out", disabled: true };
      }
      if (typeof remaining === "number" && remaining < LOW_STOCK_THRESHOLD) {
        return { tone: "low", label: "Stok Menipis", disabled: false };
      }
      return { tone: "ok", label: "Tersedia", disabled: false };
    }
    default:
      // Exhaustive over EventStatus; defensive fallback keeps the UI safe.
      return { tone: "soon", label: "Segera", disabled: false };
  }
}

/** True when an event is in the past (CLOSED, or starts before `serverNowMs`). */
export function isPastEvent(
  event: Pick<EventSummary, "status" | "startsAt">,
  serverNowMs: number,
): boolean {
  if (event.status === "CLOSED") return true;
  if (!event.startsAt) return false;
  const t = Date.parse(event.startsAt);
  return isFinite(t) && t < serverNowMs;
}

export interface CatalogSplit {
  /** Upcoming events, soonest first. */
  readonly upcoming: readonly EventSummary[];
  /** Past events, most recent first. */
  readonly history: readonly EventSummary[];
}

/**
 * Split a flat catalog into "Konser Terdekat" (upcoming asc) and "History Event"
 * (past desc), using the server clock (never the device clock). Client-side
 * derivation until the BE archive endpoint (O4) lands.
 */
export function splitCatalog(
  events: readonly EventSummary[],
  serverNowMs: number,
): CatalogSplit {
  const upcoming: EventSummary[] = [];
  const history: EventSummary[] = [];
  for (const ev of events) {
    if (isPastEvent(ev, serverNowMs)) history.push(ev);
    else upcoming.push(ev);
  }
  const startMs = (e: EventSummary): number => {
    const t = e.startsAt ? Date.parse(e.startsAt) : NaN;
    return isFinite(t) ? t : 0;
  };
  upcoming.sort((a, b) => startMs(a) - startMs(b));
  history.sort((a, b) => startMs(b) - startMs(a));
  return { upcoming, history };
}

/** Time window for the "Konser Terdekat" (nearby) derivation. */
export type NearbyWindow = "all" | "week" | "month";

/** Days per window (prototype index.html: week ≤ +7d, month ≤ +30d). */
const WINDOW_DAYS: Record<Exclude<NearbyWindow, "all">, number> = {
  week: 7,
  month: 30,
};

const DAY_MS = 86_400_000;

export interface NearbyOptions {
  /**
   * How far ahead to look. `"all"` (default) keeps every upcoming event;
   * `"week"`/`"month"` keep only events starting within +7d / +30d of
   * `serverNowMs` (boundary inclusive, matching the prototype filter).
   */
  readonly window?: NearbyWindow;
  /** Cap the result to the soonest N events (applied after the window). */
  readonly limit?: number;
}

/**
 * Derive "Konser Terdekat" — the soonest UPCOMING events, soonest first.
 *
 * Reuses `splitCatalog` (never re-implements the upcoming/history split), then
 * optionally narrows to a "this week"/"this month" window and caps the count.
 * Pure + framework-free; takes the server clock (`serverNowMs`), never the
 * device clock, so a skewed device never miscategorises an event.
 *
 * Events with no `startsAt` are still upcoming (per `splitCatalog`) and are
 * never excluded by a window — a dateless event can't fail a date boundary.
 */
export function nearbyEvents(
  events: readonly EventSummary[],
  serverNowMs: number,
  opts: NearbyOptions = {},
): readonly EventSummary[] {
  const { window = "all", limit } = opts;
  const { upcoming } = splitCatalog(events, serverNowMs);

  let result = upcoming;
  if (window !== "all") {
    const cutoff = serverNowMs + WINDOW_DAYS[window] * DAY_MS;
    result = upcoming.filter((e) => {
      if (!e.startsAt) return true; // dateless events aren't window-filtered
      const t = Date.parse(e.startsAt);
      return !isFinite(t) || t <= cutoff;
    });
  }

  return typeof limit === "number" ? result.slice(0, limit) : result;
}
