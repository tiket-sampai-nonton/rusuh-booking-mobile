/**
 * EventDetail V2 PageScreen — V2 Brutalist Mono Design
 *
 * MATCHES: `.genesis/prototype/v2-mobile/02-event-detail.html` (native)
 * MATCHES: `.oil-ui/v2/02-event-detail.html` (web)
 *
 * V2 Changes:
 * - WHITE background (not dark theme)
 * - Grayscale images with color on hover
 * - 2px black borders (NO border-radius)
 * - Ken Burns zoom on hero
 * - Scroll-triggered section reveals
 * - Floating CTA with pulse glow animation
 * - New sections: Lineup grid, Venue map, Gallery + Lightbox
 *
 * Mobile-specific (native only):
 * - Header: transparent → solid on scroll (100px threshold)
 * - Hero: 50vh height, parallax scroll
 * - Info card below hero with date/location
 * - Flow steps hidden
 * - Lineup: horizontal scroll (not grid)
 * - Floating CTA: native shadow + pulse + safe area
 * - No trust badges in CTA
 *
 * Flow: Event Detail → Waiting Room → Ticket Selection → Payment → Success
 */
import { useCallback, useState } from "react";
import { useRouter, type Href } from "expo-router";
import { Platform, ScrollView, Text, View, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";

import { ctaFor } from "@domain/rules/event-detail-cta";
import { parseDescription } from "@domain/rules/event-description";
import { eventImage } from "@domain/rules/event-image";
import { formatDateID, formatTimeID } from "@domain/services/date-format";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useEventDetail } from "@presentation/hooks/useEventDetail";
import { useJoinQueue } from "@presentation/hooks/useJoinQueue";
import { useResponsive } from "@presentation/hooks/useResponsive";

import { Block } from "./fragments/Block";
import { Categories } from "./fragments/Categories";
import { DetailBackground, V2Header, V2Steps } from "./fragments/DetailChrome";
import { DetailHero } from "./fragments/DetailHero";
import { DetailError, DetailLoading } from "./fragments/DetailStates";
import { FloatingCTA } from "./fragments/FloatingCTA";
import { Gallery, DEMO_GALLERY } from "./fragments/Gallery";
import { InfoCard } from "./fragments/InfoCard";
import { Lightbox } from "./fragments/Lightbox";
import { Lineup, DEMO_LINEUP } from "./fragments/Lineup";
import { TrustBox } from "./fragments/TrustBox";
import { Venue, DEMO_VENUE } from "./fragments/Venue";
import type { EventDetailScreenProps, LightboxState, LineupItem } from "./interface";
import { v2DetailScrollContent, v2DetailStyles as styles } from "./style";

// ═══════════════════════════════════════════════════════════════════════════════
// HERO STATUS LABEL
// ═══════════════════════════════════════════════════════════════════════════════

/** Hero status pill copy (V2 prototype: `statusLabel`). */
function heroStatusLabel(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "Penjualan Dibuka";
    case "SOLD_OUT":
      return "Sold Out";
    case "NOT_STARTED":
      return "Segera Dibuka";
    case "CLOSED":
      return "Penjualan Ditutup";
    default:
      return status;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function EventDetailScreen({ eventId }: EventDetailScreenProps) {
  const router = useRouter();
  const { data: event, isLoading, isError, error } = useEventDetail(eventId);
  const { isDesktop, isNative } = useResponsive();
  const joinQueue = useJoinQueue();

  // Lightbox state
  const [lightbox, setLightbox] = useState<LightboxState>({
    visible: false,
    currentIndex: 0,
  });

  // Wishlist state (local for now)
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Scroll state for header (native only)
  const [isScrolled, setIsScrolled] = useState(false);

  // Navigation handlers
  const goHome = useCallback((): void => {
    router.push("/" as Href);
  }, [router]);

  const handleWishlist = useCallback(() => {
    setIsWishlisted((prev) => !prev);
    // TODO: Persist to backend/storage
  }, []);

  const handleShare = useCallback(() => {
    // TODO: Implement native share sheet
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: event?.name ?? "Event",
        url: window.location.href,
      });
    }
  }, [event?.name]);

  // Scroll handler for header visibility (native only)
  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (Platform.OS !== "web") {
      const scrollY = e.nativeEvent.contentOffset.y;
      setIsScrolled(scrollY > 100);
    }
  }, []);

  // Lightbox handlers
  const openLightbox = useCallback((index: number) => {
    setLightbox({ visible: true, currentIndex: index });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox((prev) => ({ ...prev, visible: false }));
  }, []);

  const navigateLightbox = useCallback((index: number) => {
    setLightbox((prev) => ({ ...prev, currentIndex: index }));
  }, []);

  // Loading state
  if (isLoading) {
    return <DetailLoading onBack={goHome} />;
  }

  // Error state
  if (isError || !event) {
    return <DetailError message={error?.message} onBack={goHome} />;
  }

  // Parse event description (categories, lineup, terms, gallery from opaque bag)
  const desc = parseDescription(event.description);
  const cta = ctaFor(event.status);
  const dateTxt = formatDateID(event.startsAt);
  const timeTxt = formatTimeID(event.startsAt);
  const banner = eventImage(event.id, desc.bannerImage);
  const meta = [dateTxt, timeTxt, event.venue].filter(Boolean).join(" · ");

  // CTA handler: enter queue/booking flow
  const onJoin = (): void => {
    if (!cta.enabled || joinQueue.isPending) return;
    joinQueue.mutate(eventId);
  };

  // Hero chips (ticket availability info) - web only
  const chips: string[] = [];
  if (
    typeof event.remainingTickets === "number" &&
    event.status !== "SOLD_OUT" &&
    event.status !== "CLOSED"
  ) {
    chips.push(`${event.remainingTickets.toLocaleString("id-ID")} tiket tersedia`);
  }
  chips.push("Maks 3 tiket / NIK");

  // Parse lineup from description or use demo data
  const lineup: LineupItem[] =
    desc.lineup.length > 0
      ? desc.lineup.map((name) => ({ name, role: "Performer" }))
      : DEMO_LINEUP;

  // Parse gallery from description or use demo data
  const galleryImages = desc.gallery?.length ? desc.gallery : DEMO_GALLERY;

  // Parse venue info from event or use demo
  const venueInfo = event.venue
    ? {
        name: event.venue.split("·")[0]?.trim() ?? event.venue,
        address: event.venue.includes("·")
          ? event.venue.split("·").slice(1).join("·").trim()
          : "",
        mapImage: undefined as string | undefined,
        mapsUrl: undefined as string | undefined,
      }
    : DEMO_VENUE;

  return (
    <ScreenFade>
      <DetailBackground testID="event-detail-screen">
        {/* Fixed Header */}
        <V2Header
          onBack={goHome}
          onWishlist={isNative ? undefined : handleWishlist} // Wishlist web only
          onShare={handleShare}
          isWishlisted={isWishlisted}
          isScrolled={isScrolled}
        />

        {/* Scrollable Content */}
        <ScrollView
          contentContainerStyle={v2DetailScrollContent(isDesktop)}
          testID="detail-scroll"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Flow Steps Indicator (web only - hidden via styles on native) */}
          <V2Steps activeStep={1} />

          {/* Hero Section (Grayscale + Ken Burns/Settle) */}
          <DetailHero
            banner={banner}
            statusLabel={heroStatusLabel(event.status)}
            name={event.name}
            meta={meta}
            chips={chips}
            subtitle={desc.subtitle}
          />

          {/* Content Sections */}
          <View style={styles.content}>
            {/* Info Card (native only - date/location) */}
            <InfoCard
              date={dateTxt}
              time={timeTxt}
              venue={event.venue ?? "Lokasi akan diumumkan"}
            />

            {/* Ticket Categories Preview — FIRST per prototype section order */}
            <Block label="Kategori Tiket">
              <Categories categories={desc.categories} />
            </Block>

            {/* About Event */}
            <Block label="Tentang Event">
              <Text style={styles.description}>
                {desc.longDesc || "Deskripsi event belum tersedia."}
              </Text>
            </Block>

            {/* Lineup Grid/Scroll */}
            <Block label="Line Up">
              <Lineup items={lineup} />
            </Block>

            {/* These sections belong to the desktop/detail prototype. The
                mobile reference ends after Line Up before the fixed CTA. */}
            {!isNative && (
              <>
                <Block label="Lokasi">
                  <Venue
                    name={venueInfo.name}
                    address={venueInfo.address}
                    mapImage={venueInfo.mapImage}
                    mapsUrl={venueInfo.mapsUrl}
                  />
                </Block>

                <Block label="Galeri">
                  <Gallery images={galleryImages} onImagePress={openLightbox} />
                </Block>

                <Block label="Syarat & Ketentuan">
                  {desc.terms.length > 0 ? (
                    <View style={styles.termsList}>
                      {desc.terms.map((t) => (
                        <View key={t} style={styles.termsItem}>
                          <Text style={styles.termsCheck}>✓</Text>
                          <Text style={styles.termsText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.description}>Ketentuan menyusul.</Text>
                  )}
                </Block>
              </>
            )}

            {/* Trust Box (web only - can be removed if using inline badges) */}
            {!isNative && (
              <Block label="Jaminan Kami">
                <TrustBox />
              </Block>
            )}
          </View>
        </ScrollView>

        {/* Floating CTA (fixed bottom) */}
        <FloatingCTA
          event={event}
          canJoin={cta.enabled}
          ctaLabel={cta.label}
          onJoin={onJoin}
        />

        {/* Lightbox Modal */}
        <Lightbox
          images={galleryImages}
          currentIndex={lightbox.currentIndex}
          visible={lightbox.visible}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      </DetailBackground>
    </ScreenFade>
  );
}
