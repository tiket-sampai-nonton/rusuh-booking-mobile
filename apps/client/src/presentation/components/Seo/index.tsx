/**
 * Seo — per-route <head> metadata for web static rendering (RBT-033, §6.6).
 *
 * Wraps expo-router's Head so each route can declare title, description,
 * canonical URL, Open Graph + Twitter tags, optional JSON-LD, and a noindex
 * flag. Public catalog pages (/, /browse, /events/[id], /history) are
 * indexable; transactional pages (waiting/checkout/payment/success/expired)
 * pass `noindex` so a crawler never sees queue position, NIK, or payment state
 * (SECURITY.md §; D6.2 / ARCHITECTURE §6.5).
 *
 * Web-only concern: Head renders to the DOM <head> during static export and is
 * a no-op on native, so this is safe to mount from a shared screen. It is a
 * presentation component — no infrastructure import.
 */
import Head from "expo-router/head";

const SITE_NAME = "Rusuh Booking Tiket";
const BASE_URL =
  process.env.EXPO_PUBLIC_SITE_URL ?? "https://rusuh-booking.example";

export interface SeoProps {
  readonly title: string;
  readonly description: string;
  /** Path (e.g. "/events/evt-1") → canonical = BASE_URL + path. */
  readonly path: string;
  /** When true, emit robots noindex,nofollow (transactional pages). */
  readonly noindex?: boolean;
  /** Social share image (absolute or site-relative). */
  readonly image?: string;
  /** Optional JSON-LD object (e.g. schema.org Event) for rich results. */
  readonly jsonLd?: Record<string, unknown>;
}

export function Seo({
  title,
  description,
  path,
  noindex = false,
  image,
  jsonLd,
}: SeoProps): React.JSX.Element {
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} · ${SITE_NAME}`;
  const canonical = `${BASE_URL}${path}`;
  const ogImage = image ?? `${BASE_URL}/og-default.png`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow" />
      )}
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {/* JSON-LD structured data (rich results). react-native-helmet-async
          renders a <script> whose JSON is the text child (not
          dangerouslySetInnerHTML, which helmet drops). */}
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Head>
  );
}

/** Build a schema.org Event JSON-LD object from event fields (rich results). */
export function eventJsonLd(input: {
  name: string;
  path: string;
  startsAt?: string;
  venue?: string;
  priceFromMinor?: number;
  soldOut?: boolean;
}): Record<string, unknown> {
  const offers = buildEventOffer(input.priceFromMinor, input.soldOut);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.name,
    url: `${BASE_URL}${input.path}`,
    ...(input.startsAt ? { startDate: input.startsAt } : {}),
    ...(input.venue
      ? { location: { "@type": "Place", name: input.venue } }
      : {}),
    eventStatus: "https://schema.org/EventScheduled",
    ...(offers ? { offers } : {}),
  };
}

function buildEventOffer(
  priceFromMinor: number | undefined,
  soldOut: boolean | undefined,
): Record<string, unknown> | undefined {
  if (priceFromMinor === undefined) return undefined;
  const availability = soldOut
    ? "https://schema.org/SoldOut"
    : "https://schema.org/InStock";

  return {
    "@type": "Offer",
    priceCurrency: "IDR",
    price: Math.round(priceFromMinor / 100),
    availability,
  };
}
