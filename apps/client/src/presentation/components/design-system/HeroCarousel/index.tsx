import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, View } from "react-native";
import Head from "expo-router/head";
import FastImage from "react-native-fast-image";
import {
  cancelAnimation,
  Easing,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import type { EventSummary } from "@domain/repositories/event.repository";
import { eventImage } from "@domain/rules/event-image";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useServices } from "@providers/service-context";

import {
  FADE_DURATION_MS,
  SLIDE_DURATION_MS,
  ZOOM_DURATION_MS,
} from "./constants";
import { HeroInfo } from "./fragments/HeroInfo";
import { HeroInfoMobile } from "./fragments/HeroInfoMobile";
import { HeroSlide } from "./fragments/HeroSlide";
import { GradientOverlay } from "./fragments/GradientOverlay";
import { HeroTitle } from "./fragments/HeroTitle";
import { ScrollIndicator } from "./fragments/ScrollIndicator";
import { SlideDots } from "./fragments/SlideDots";
import {
  componentStyles,
  styleForHeroCarouselView12,
  styleForHeroCarouselView13,
} from "./style";
import { heroInfoColumnStyle } from "./style";

export interface HeroCarouselProps {
  readonly events: readonly EventSummary[];
  readonly onBook: (eventId: string) => void;
  readonly onSeeAll: () => void;
  /** Mobile Home prototype uses one static featured hero. */
  readonly autoPlay?: boolean;
  /** Pause visual work while its route is covered by another screen. */
  readonly isActive?: boolean;
}

export function HeroCarousel({
  events,
  onBook,
  onSeeAll,
  autoPlay = true,
  isActive = true,
}: HeroCarouselProps) {
  const { serverClock } = useServices();
  const reducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [glitchIndex, setGlitchIndex] = useState<number | null>(null);
  const [heroImagesReady, setHeroImagesReady] = useState(false);
  const [initialHeroImageReady, setInitialHeroImageReady] = useState(
    Platform.OS === "web",
  );
  const zoom = useSharedValue(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const {
    width: screenWidth,
    height: screenHeight,
    heroHeightVh,
    isNative,
    isMobileWeb,
  } = useResponsive();
  // Keep the active native slide stable when its route blurs. `autoPlay` is
  // focus-driven by Home; shrinking `top` to one item on blur invalidated a
  // previously selected slide and could temporarily blank the whole hero.
  const top = useMemo(
    () => events.slice(0, autoPlay || isNative ? 3 : 1),
    [events, autoPlay, isNative],
  );
  const imageUris = useMemo(
    () =>
      top.map((event) => {
        const uri = eventImage(event.id, event.bannerUrl ?? event.imageUrl);
        return Platform.OS === "web"
          ? resizeWebHeroImage(uri, screenWidth)
          : uri;
      }),
    [screenWidth, top],
  );

  // Warm the same image cache used by CachedImage before a slide can become
  // active. Disk-only preloading avoids decoding every large banner into RAM.
  useEffect(() => {
    let cancelled = false;
    if (imageUris.length === 0) {
      setHeroImagesReady(false);
      setInitialHeroImageReady(false);
      return () => {
        cancelled = true;
      };
    }
    setHeroImagesReady(false);
    const preload = FastImage.preload;
    if (typeof preload !== "function") {
      setHeroImagesReady(true);
      setInitialHeroImageReady(true);
      return () => {
        cancelled = true;
      };
    }

    const sources = imageUris.map((uri) => ({ uri, memoryCache: false }));
    if (Platform.OS !== "web") {
      void preload(sources).then(() => {
        if (!cancelled) {
          setHeroImagesReady(true);
          setInitialHeroImageReady(true);
        }
      });
    } else {
      void preload(sources.slice(0, 1)).then(() => {
        if (cancelled) return;
        setInitialHeroImageReady(true);
        const remainingSources = sources.slice(1);
        if (remainingSources.length === 0) {
          setHeroImagesReady(true);
          return;
        }
        void preload(remainingSources).then(() => {
          if (!cancelled) setHeroImagesReady(true);
        });
      });
    }
    return () => {
      cancelled = true;
    };
  }, [imageUris]);

  // The approved mobile web hero is a compact image-led banner below the site
  // header. Native and desktop keep their existing viewport-based layouts.
  const heroHeight = isMobileWeb
    ? 246
    : Math.max(480, (screenHeight * heroHeightVh) / 100);

  // Responsive: single column on narrow screens (<900px per prototype @media query)
  // For native: ALWAYS use mobile layout regardless of screen width
  const isNarrow = screenWidth < 900 || isNative;
  const shouldAnimateZoom = !reducedMotion && isActive && !isNative;

  const scheduleTransitionReset = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      clearTimeout(transitionTimeoutRef.current);
    }
    transitionTimeoutRef.current = setTimeout(() => {
      transitionTimeoutRef.current = null;
      setPrevIndex(null);
      setGlitchIndex(null);
    }, FADE_DURATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (transitionTimeoutRef.current !== null) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    if (isActive) return;
    if (transitionTimeoutRef.current !== null) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    setPrevIndex(null);
    setGlitchIndex(null);
  }, [isActive]);

  // Ken Burns zoom loop (20s): scale 1 → 1.05 → 1
  useEffect(() => {
    if (!shouldAnimateZoom) return;
    zoom.value = withRepeat(
      withTiming(1, {
        duration: ZOOM_DURATION_MS,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
    return () => cancelAnimation(zoom);
  }, [shouldAnimateZoom, zoom]);

  // Show slide with glitch effect
  const showSlide = (index: number) => {
    if (index === currentIndex || index < 0 || index >= top.length) return;
    setPrevIndex(currentIndex);
    setGlitchIndex(index);
    setCurrentIndex(index);
    scheduleTransitionReset();
  };

  // Auto-advance slides (6s interval)
  useEffect(() => {
    if (!autoPlay || !isActive || !heroImagesReady || top.length <= 1) return;
    intervalRef.current = setInterval(() => {
      const previous = currentIndex % top.length;
      const next = (previous + 1) % top.length;
      if (!reducedMotion) {
        setPrevIndex(previous);
        setGlitchIndex(next);
        scheduleTransitionReset();
      }
      setCurrentIndex(next);
    }, SLIDE_DURATION_MS);
    return () => {
      clearInterval(intervalRef.current as ReturnType<typeof setInterval>);
      intervalRef.current = null;
    };
  }, [
    autoPlay,
    currentIndex,
    heroImagesReady,
    isActive,
    reducedMotion,
    scheduleTransitionReset,
    top.length,
  ]);

  const handleDotPress = (index: number) => {
    showSlide(index);
  };

  const activeIndex = currentIndex % top.length;
  const currentEvent = top[activeIndex];
  if (!currentEvent) return null;

  const targetDateIso = currentEvent.startsAt;

  return (
    <View style={styleForHeroCarouselView12(heroHeight)} testID="v2-hero">
      {Platform.OS === "web" && imageUris[0] ? (
        <Head>
          <link rel="preconnect" href="https://images.unsplash.com" />
          <link
            rel="preload"
            as="image"
            href={imageUris[0]}
            fetchPriority="high"
          />
        </Head>
      ) : null}
      {/* Background slides (prototype .hero-slides) */}
      <View style={componentStyles.elementPosition32}>
        {(Platform.OS === "web" ? initialHeroImageReady : heroImagesReady) &&
          top.map((ev, i) =>
            i === activeIndex || i === prevIndex ? (
              <HeroSlide
                key={ev.id}
                uri={imageUris[i]}
                active={i === activeIndex}
                isPrev={i === prevIndex}
                isGlitching={i === glitchIndex}
                zoomValue={zoom}
                reduced={Boolean(reducedMotion)}
              />
            ) : null,
          )}
      </View>

      {/* Gradient overlay (prototype .hero-slide-overlay) */}
      <GradientOverlay isMobile={isNative} isMobileWeb={isMobileWeb} />

      {/*
        Content container — layout differs between mobile and desktop:

        Desktop (v2/01-home.html):
        - grid: 1fr 400px, gap: --space-l
        - Title left (flex 1), Info right (400px fixed)
        - Aligned to bottom of hero

        Mobile (v2-mobile/01-home.html):
        - Single column, content stacked
        - Badge → Title → Meta → CTA
        - Positioned at bottom with frame padding
      */}
      <View style={styleForHeroCarouselView13(isNative, isNarrow, isMobileWeb)}>
        {/*
          Native (mobile): Use HeroInfoMobile which includes the title
          Web/Desktop: Separate title column + HeroInfo column
        */}
        {isNative || isMobileWeb ? (
          // Mobile: Single stacked component with Badge + Title + Meta + CTA
          <HeroInfoMobile
            event={currentEvent}
            onBook={onBook}
            onSeeAll={onSeeAll}
            isMobileWeb={isMobileWeb}
          />
        ) : (
          <>
            {/* Left column: Title (flex: 1, aligned to bottom) */}
            <View style={componentStyles.elementFlex33}>
              <HeroTitle name={currentEvent.name} />
            </View>

            {/* Right column: Info (fixed 400px width on desktop) */}
            <View style={heroInfoColumnStyle(isNarrow)}>
              <HeroInfo
                event={currentEvent}
                targetDateIso={targetDateIso}
                clock={serverClock}
                onBook={onBook}
                onSeeAll={onSeeAll}
              />
            </View>
          </>
        )}
      </View>

      {/* Navigation dots (prototype .hero-nav) - bottom right */}
      {/* On native mobile: hide dots for cleaner look per v2-mobile prototype (no carousel nav) */}
      {!isNative && !isMobileWeb && top.length > 1 && (
        <SlideDots
          count={top.length}
          current={currentIndex}
          onSelect={handleDotPress}
        />
      )}

      {/* Scroll indicator (prototype .scroll-indicator) - bottom left, desktop only */}
      {!isNarrow && isActive && <ScrollIndicator />}
    </View>
  );
}

function resizeWebHeroImage(uri: string, viewportWidth: number): string {
  if (!uri.includes("images.unsplash.com")) return uri;

  const [path, query = ""] = uri.split("?", 2);
  const params = new URLSearchParams(query);
  // On mobile, match the first event-card candidate so the browser reuses the
  // same cached image instead of downloading a second, larger hero variant.
  const requestedWidth =
    viewportWidth <= 900 ? 640 : Math.min(1600, Math.ceil(viewportWidth * 1.5));
  params.set("w", String(requestedWidth));
  params.set("q", viewportWidth <= 900 ? "56" : "68");
  return `${path}?${params.toString()}`;
}

export default HeroCarousel;
