/**
 * Event description parser — pure domain (framework-free).
 *
 * `EventDetail.description` is an opaque `Record<string, unknown>` (FE-NEED O1:
 * the BE `description` JSON shape is not finalised, so the port models it as an
 * untyped bag). This rule safely narrows it into the fields the detail screen
 * renders — longDesc, lineup, terms — tolerating missing / wrong-typed values
 * so a contract drift degrades gracefully instead of crashing the screen.
 */

export interface ParsedDescription {
  readonly longDesc: string;
  readonly lineup: readonly string[];
  readonly terms: string;
  readonly bannerImage?: string;
}

/** Narrow an unknown value to a trimmed string, or "" when not a string. */
function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** Narrow an unknown value to a string[] of non-empty strings. */
function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.length > 0);
}

/**
 * Parse the opaque description bag into typed, render-safe fields. A nullish or
 * non-object input yields empty defaults.
 */
export function parseDescription(
  description: Readonly<Record<string, unknown>> | null | undefined,
): ParsedDescription {
  const d = description ?? {};
  const banner = asString(d.bannerImage);
  return {
    longDesc: asString(d.longDesc),
    lineup: asStringArray(d.lineup),
    terms: asString(d.terms),
    bannerImage: banner.length > 0 ? banner : undefined,
  };
}
