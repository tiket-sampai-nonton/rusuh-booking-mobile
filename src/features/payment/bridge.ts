// Validasi pesan bridge dan aturan navigasi WebView (SDD, Aturan WebView).
export const BRIDGE_TYPES = [
  "PAYMENT_PENDING",
  "PAYMENT_VERIFYING",
  "PAYMENT_SUCCESS",
  "PAYMENT_EXPIRED",
  "EDIT_ORDER",
  "CLOSE",
] as const;

export type BridgeType = (typeof BRIDGE_TYPES)[number];
export type BridgeEvent = { type: BridgeType; bookingId: string };

const EXTERNAL_SCHEMES = ["gojek://", "shopeeid://", "intent://"];

/** Mengembalikan event bila payload valid; selain itu null. */
export function parseBridgeMessage(raw: string): BridgeEvent | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const { type, bookingId } = data as Record<string, unknown>;
  if (typeof type !== "string" || !(BRIDGE_TYPES as readonly string[]).includes(type)) return null;
  if (typeof bookingId !== "string" || bookingId.length === 0) return null;
  return { type: type as BridgeType, bookingId };
}

/** Deeplink e-wallet dibuka di luar WebView. */
export function isExternalScheme(url: string): boolean {
  return EXTERNAL_SCHEMES.some((s) => url.startsWith(s));
}

/** Hanya domain aplikasi yang boleh dimuat di WebView dan mengirim pesan bridge. */
export function isAllowedOrigin(url: string, webBaseUrl: string): boolean {
  try {
    return new URL(url).origin === new URL(webBaseUrl).origin;
  } catch {
    return false;
  }
}
