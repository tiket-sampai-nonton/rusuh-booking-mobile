/**
 * EventDetail  PageScreen —  Brutalist Mono Design
 *
 * MATCHES: `.genesis/prototype/v2-mobile/02-event-detail.html` (native)
 * MATCHES: `.oil-ui/v2/02-event-detail.html` (web)
 *
 *  Changes:
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
import { useFocusEffect, useRouter, type Href } from "expo-router";
import {
  Platform,
  ScrollView,
  Share,
  Text,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";

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
import { DetailBackground, Header, Steps } from "./fragments/DetailChrome";
import { DetailHero } from "./fragments/DetailHero";
import { DetailError, DetailLoading } from "./fragments/DetailStates";
import { FloatingCTA } from "./fragments/FloatingCTA";
import { Gallery } from "./fragments/Gallery";
import { InfoCard } from "./fragments/InfoCard";
import { Lightbox } from "./fragments/Lightbox";
import { Lineup } from "./fragments/Lineup";
import { TrustBox } from "./fragments/TrustBox";
import { Venue } from "./fragments/Venue";
import type { EventDetailScreenProps, LightboxState } from "./interface";
import {
  designDetailScrollContent,
  designDetailStyles as styles,
} from "./style";
import { CheckIcon } from "@presentation/components/ArrowIcon";
import { designColors } from "@presentation/theme";

// ═══════════════════════════════════════════════════════════════════════════════
// HERO STATUS LABEL
// ═══════════════════════════════════════════════════════════════════════════════

/** Hero status pill copy ( prototype: `statusLabel`). */
function heroStatusLabel(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "Penjualan Dibuka";
    case "SOLD_OUT":
      return "Tiket Habis";
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

export function EventDetailScreen({
  eventId,
  hideQueueCta = false,
}: EventDetailScreenProps) {
  const router = useRouter();
  const {
    data: event,
    isLoading,
    isError,
    error,
    refetch: retryEventDetail,
    isFetching: isRetryingEventDetail,
  } = useEventDetail(eventId);
  const { isDesktop, isNative, isMobileWeb } = useResponsive();
  const joinQueue = useJoinQueue();

  // Lightbox state
  const [lightbox, setLightbox] = useState<LightboxState>({
    visible: false,
    currentIndex: 0,
  });

  // Scroll state for header (native only)
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, []),
  );

  // Navigation handlers
  const goHome = useCallback((): void => {
    router.navigate("/" as Href);
  }, [router]);

  const handleShare = useCallback(() => {
    const siteUrl = (
      process.env.EXPO_PUBLIC_SITE_URL ?? "https://rusuh-booking.pages.dev"
    ).replace(/\/+$/, "");
    const url = `${siteUrl}/events/${encodeURIComponent(eventId)}`;

    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.share) {
        void navigator.share({ url }).catch(() => {
          void navigator.clipboard?.writeText(url);
        });
      } else if (typeof navigator !== "undefined") {
        void navigator.clipboard?.writeText(url);
      }
      return;
    }

    void Share.share({ message: url }).catch(() => undefined);
  }, [eventId]);

  // Scroll handler for header visibility (native only)
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (Platform.OS !== "web") {
        const scrollY = e.nativeEvent.contentOffset.y;
        setIsScrolled(scrollY > 100);
      }
    },
    [],
  );

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
    return <DetailLoading />;
  }

  // Error state
  if (isError || !event) {
    return (
      <DetailError
        error={error}
        onBack={goHome}
        onRetry={() => void retryEventDetail()}
        isRetrying={isRetryingEventDetail}
      />
    );
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
    chips.push(
      `${event.remainingTickets.toLocaleString("id-ID")} tiket tersedia`,
    );
  }
  const purchaseLimits = [
    event.maxTicketsPerOrder && `${event.maxTicketsPerOrder} tiket / pesanan`,
    event.maxTicketsPerBuyerNik && `${event.maxTicketsPerBuyerNik} tiket / NIK`,
  ].filter((value): value is string => Boolean(value));
  if (purchaseLimits.length > 0) {
    chips.push(`Maks ${purchaseLimits.join(" · ")}`);
  }

  const galleryImages = desc.gallery ?? [];

  // Use venue details from the event. Missing venue data stays visibly missing.
  const venueInfo = createVenueInfo(event.venue, desc.location);

  return (
    <ScreenFade>
      <DetailBackground testID="event-detail-screen">
        {/* Fixed Header */}
        <Header
          onBack={goHome}
          onShare={handleShare}
          isScrolled={isScrolled}
          isMobileWeb={isMobileWeb}
        />

        {/* Scrollable Content */}
        <ScrollView
          contentContainerStyle={designDetailScrollContent(
            isDesktop,
            isMobileWeb,
          )}
          testID="detail-scroll"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Flow Steps Indicator (web only - hidden via styles on native) */}
          <Steps activeStep={1} isMobileWeb={isMobileWeb} />

          {/* Hero Section (Grayscale + Ken Burns/Settle) */}
          <DetailHero
            banner={banner}
            statusLabel={heroStatusLabel(event.status)}
            name={event.name}
            meta={meta}
            chips={chips}
            subtitle={desc.subtitle}
            isMobileWeb={isMobileWeb}
            isActive={isScreenFocused}
          />

          {isMobileWeb ? (
            <View style={styles.mobileWebTicketStats}>
              <View style={styles.mobileWebTicketStat}>
                <Text style={styles.mobileWebTicketStatLabel}>
                  Tiket tersedia
                </Text>
                <Text style={styles.mobileWebTicketStatValue}>
                  {typeof event.remainingTickets === "number"
                    ? `${event.remainingTickets.toLocaleString("id-ID")} tiket`
                    : "Cek saat checkout"}
                </Text>
              </View>
              <View style={styles.mobileWebTicketStat}>
                <Text style={styles.mobileWebTicketStatLabel}>
                  Maks. pembelian
                </Text>
                <Text style={styles.mobileWebTicketStatValue}>
                  {purchaseLimits.length > 0
                    ? purchaseLimits.join(" · ")
                    : "Sesuai ketentuan event"}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Content Sections */}
          <View
            style={[styles.content, isMobileWeb && styles.mobileWebContent]}
          >
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
                {desc.longDesc || "Informasi tentang acara ini belum tersedia."}
              </Text>
            </Block>

            {/* Lineup Grid/Scroll */}
            <Block label="Pengisi Acara">
              <Lineup items={desc.lineup} />
            </Block>

            {/* Both native and web share these event information sections. */}
            <>
              <Block label="Lokasi">
                {venueInfo ? (
                  <Venue
                    name={venueInfo.name}
                    address={venueInfo.address}
                    mapImage={venueInfo.mapImage}
                    mapsUrl={venueInfo.mapsUrl}
                  />
                ) : (
                  <Text style={styles.description}>
                    Informasi lokasi akan diumumkan penyelenggara.
                  </Text>
                )}
              </Block>

              <Block label="Galeri">
                <Gallery images={galleryImages} onImagePress={openLightbox} />
              </Block>

              <Block label="Syarat dan ketentuan">
                {desc.terms.length > 0 ? (
                  <View style={styles.termsList}>
                    {desc.terms.map((t) => (
                      <View key={t} style={styles.termsItem}>
                        <CheckIcon color={designColors.ink} size={14} />
                        <Text style={styles.termsText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.description}>
                    Informasi syarat dan ketentuan belum tersedia.
                  </Text>
                )}
              </Block>
            </>

            {/* Trust Box (web only - can be removed if using inline badges) */}
            {!isNative && (
              <Block label="Jaminan Kami">
                <TrustBox />
              </Block>
            )}
          </View>
        </ScrollView>

        {/* Floating CTA (fixed bottom) */}
        {!hideQueueCta ? (
          <FloatingCTA
            event={event}
            canJoin={cta.enabled}
            ctaLabel={cta.label}
            onJoin={onJoin}
            isMobileWeb={isMobileWeb}
            isActive={isScreenFocused}
            isJoining={joinQueue.isPending}
            errorMessage={joinQueue.isError ? joinQueue.error : undefined}
          />
        ) : null}

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

function createVenueInfo(
  venue?: string,
  location?: ReturnType<typeof parseDescription>["location"],
) {
  if (!venue && !location) return undefined;
  const [venueName = "", ...addressParts] = (venue ?? "").split("·");
  const coordinateQuery =
    typeof location?.latitude === "number" &&
    typeof location.longitude === "number"
      ? `${location.latitude},${location.longitude}`
      : undefined;
  return {
    name: location?.name ?? venueName.trim(),
    address: location?.address ?? addressParts.join("·").trim(),
    mapImage: location?.mapImage,
    mapsUrl:
      location?.mapsUrl ??
      (coordinateQuery
        ? `https://maps.google.com/?q=${encodeURIComponent(coordinateQuery)}`
        : undefined),
  };
}
