import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
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
}

export function HeroCarousel({
  events,
  onBook,
  onSeeAll,
  autoPlay = true,
}: HeroCarouselProps) {
  const { serverClock } = useServices();
  const reducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [glitchIndex, setGlitchIndex] = useState<number | null>(null);
  const top = events.slice(0, autoPlay ? 3 : 1);
  const zoom = useSharedValue(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const {
    width: screenWidth,
    height: screenHeight,
    heroHeightVh,
    isNative,
    isMobileWeb,
  } = useResponsive();

  // The approved mobile web hero is a compact image-led banner below the site
  // header. Native and desktop keep their existing viewport-based layouts.
  const heroHeight = isMobileWeb
    ? 246
    : Math.max(480, (screenHeight * heroHeightVh) / 100);

  // Responsive: single column on narrow screens (<900px per prototype @media query)
  // For native: ALWAYS use mobile layout regardless of screen width
  const isNarrow = screenWidth < 900 || isNative;

  // Ken Burns zoom loop (20s): scale 1 → 1.05 → 1
  useEffect(() => {
    if (reducedMotion) return;
    zoom.value = withRepeat(
      withTiming(1, {
        duration: ZOOM_DURATION_MS,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
    return () => cancelAnimation(zoom);
  }, [reducedMotion, zoom]);

  // Show slide with glitch effect
  const showSlide = (index: number) => {
    if (index === currentIndex) return;
    setPrevIndex(currentIndex);
    setGlitchIndex(index);
    setCurrentIndex(index);

    setTimeout(() => {
      setPrevIndex(null);
      setGlitchIndex(null);
    }, FADE_DURATION_MS);
  };

  // Auto-advance slides (6s interval)
  useEffect(() => {
    if (!autoPlay || top.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % top.length;
        if (!reducedMotion) {
          setPrevIndex(prev);
          setGlitchIndex(next);
          setTimeout(() => {
            setPrevIndex(null);
            setGlitchIndex(null);
          }, FADE_DURATION_MS);
        }
        return next;
      });
    }, SLIDE_DURATION_MS);
    return () => {
      clearInterval(intervalRef.current as ReturnType<typeof setInterval>);
      intervalRef.current = null;
    };
  }, [autoPlay, reducedMotion, top.length]);

  const handleDotPress = (index: number) => {
    showSlide(index);
    // Reset timer
    clearInterval(intervalRef.current as ReturnType<typeof setInterval>);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % top.length;
        if (!reducedMotion) {
          setPrevIndex(prev);
          setGlitchIndex(next);
          setTimeout(() => {
            setPrevIndex(null);
            setGlitchIndex(null);
          }, FADE_DURATION_MS);
        }
        return next;
      });
    }, SLIDE_DURATION_MS);
  };

  const currentEvent = top[currentIndex];
  if (!currentEvent) return null;

  const targetDateIso = currentEvent.startsAt;

  return (
    <View style={styleForHeroCarouselView12(heroHeight)} testID="v2-hero">
      {/* Background slides (prototype .hero-slides) */}
      <View style={componentStyles.elementPosition32}>
        {top.map((ev, i) => (
          <HeroSlide
            key={ev.id}
            uri={eventImage(ev.id, ev.bannerUrl ?? ev.imageUrl)}
            active={i === currentIndex}
            isPrev={i === prevIndex}
            isGlitching={i === glitchIndex}
            zoomValue={zoom}
            reduced={Boolean(reducedMotion)}
          />
        ))}
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
      {!isNarrow && <ScrollIndicator />}
    </View>
  );
}

export default HeroCarousel;
