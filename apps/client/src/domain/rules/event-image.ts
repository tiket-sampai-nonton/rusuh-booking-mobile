/**
 * Event image resolution — pure domain (framework-free).
 *
 * The catalog + hero use contract image URLs when available, with a stable
 * per-event photo as the deterministic fallback. The URLs mirror the
 * prototype's Unsplash set; no remote image is invented when a contract URL
 * exists.
 */

/** The prototype's Unsplash concert-photo set (public URLs). */
export const EVENT_IMAGES: readonly string[] = [
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80&auto=format&fit=crop",
];

/** Stable non-negative hash of a string (deterministic across platforms). */
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Resolve the image URL for an event. Prefers a supplied contract image URL,
 * else a stable photo chosen by event id.
 */
export function eventImage(
  eventId: string,
  bannerImage?: string | null,
): string {
  if (typeof bannerImage === "string" && bannerImage.length > 0) {
    return bannerImage;
  }
  return EVENT_IMAGES[hashId(eventId) % EVENT_IMAGES.length];
}
