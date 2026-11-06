/**
 * Event rich-description parsing — pure domain (framework-free).
 *
 * The frozen `EventDetail.description` is an OPAQUE `Record<string, unknown>`
 * (FE-NEED O1: the BE `EventDetail.description` / pricing categories are not yet
 * typed on the wire). The detail screen must read it DEFENSIVELY — never assume
 * a field exists or has a given type — and tolerate both the fixture shape
 * (`lineup: string[]`, `terms: string`) and the prototype shape
 * (`lineup: {stage,acts}[]`, `terms: string[]`). This module normalises the bag
 * into a typed, UI-ready view; everything missing or mistyped degrades to a safe
 * empty default so the screen never throws on malformed data. The local mock
 * fixture may also supply performer `{name,role,avatar}` records.
 */

/** A pricing category + its availability (prototype `.cat`). */
export interface EventCategory {
  readonly code: string;
  readonly name: string;
  /** Minor-unit IDR (integer). */
  readonly priceMinor: number;
  /** Remaining stock for this category; 0 → "Habis". */
  readonly available: number;
}

/** Normalised, UI-ready view of the opaque description record. */
export interface ParsedDescription {
  readonly longDesc: string;
  readonly lineup: readonly ParsedLineupItem[];
  readonly terms: readonly string[];
  readonly bannerImage?: string;
  readonly categories: readonly EventCategory[];
  /** : Optional subtitle shown below hero title. */
  readonly subtitle?: string;
  /** : Gallery image URLs for the event detail page. */
  readonly gallery?: readonly string[];
}

/** Performer details parsed from the event's opaque description payload. */
export interface ParsedLineupItem {
  readonly name: string;
  readonly role: string;
  readonly avatar?: string;
}

const EMPTY: ParsedDescription = {
  longDesc: "",
  lineup: [],
  terms: [],
  bannerImage: undefined,
  categories: [],
  subtitle: undefined,
  gallery: undefined,
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asFiniteNumber(v: unknown): number {
  return typeof v === "number" && isFinite(v) ? v : 0;
}

/** Normalise supported lineup records without inventing performer data. */
function lineupEntry(v: unknown): ParsedLineupItem | null {
  if (typeof v === "string") {
    const s = v.trim();
    return s.length > 0 ? { name: s, role: "Performer" } : null;
  }
  if (isRecord(v)) {
    const name = asString(v.name).trim();
    if (name.length > 0) {
      const avatar = asString(v.avatar).trim();
      return {
        name,
        role: asString(v.role).trim() || "Performer",
        ...(avatar.length > 0 ? { avatar } : {}),
      };
    }
    const stage = asString(v.stage).trim();
    const acts = asString(v.acts).trim();
    const joined = [stage, acts].filter((p) => p.length > 0).join(" — ");
    return joined.length > 0 ? { name: joined, role: "Performer" } : null;
  }
  return null;
}

function parseLineup(v: unknown): ParsedLineupItem[] {
  if (!Array.isArray(v)) return [];
  const out: ParsedLineupItem[] = [];
  for (const item of v) {
    const entry = lineupEntry(item);
    if (entry !== null) out.push(entry);
  }
  return out;
}

/** Terms may be a single string (fixture) or a string[] (prototype). */
function parseTerms(v: unknown): string[] {
  if (typeof v === "string") {
    const s = v.trim();
    return s.length > 0 ? [s] : [];
  }
  if (Array.isArray(v)) {
    return v.map((t) => asString(t).trim()).filter((t) => t.length > 0);
  }
  return [];
}

function parseCategories(v: unknown): EventCategory[] {
  if (!Array.isArray(v)) return [];
  const out: EventCategory[] = [];
  for (const item of v) {
    if (!isRecord(item)) continue;
    out.push({
      code: asString(item.code),
      name: asString(item.name),
      priceMinor: asFiniteNumber(item.priceMinor),
      available: asFiniteNumber(item.available),
    });
  }
  return out;
}

/** Parse gallery images array. */
function parseGallery(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const urls = v
    .map((item) => asString(item).trim())
    .filter((url) => url.length > 0);
  return urls.length > 0 ? urls : undefined;
}

/**
 * Parse the opaque `EventDetail.description` into a safe, typed view. A nullish
 * or non-object value yields all-empty defaults (the screen renders its
 * "belum tersedia" fallbacks).
 */
export function parseDescription(
  description: Readonly<Record<string, unknown>> | undefined | null,
): ParsedDescription {
  if (!isRecord(description)) return EMPTY;
  const banner = asString(description.bannerImage).trim();
  const subtitle = asString(description.subtitle).trim();
  return {
    longDesc: asString(description.longDesc),
    lineup: parseLineup(description.lineup),
    terms: parseTerms(description.terms),
    bannerImage: banner.length > 0 ? banner : undefined,
    categories: parseCategories(description.categories),
    subtitle: subtitle.length > 0 ? subtitle : undefined,
    gallery: parseGallery(description.gallery),
  };
}
