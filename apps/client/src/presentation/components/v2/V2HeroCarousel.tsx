/**
 * RBT-096 — V2HeroCarousel
 *
 * 1:1 implementation from .genesis/prototype/v2/01-home.html
 *
 * Prototype structure (CSS lines 445-730, JS lines 2410-2540):
 * - .hero: min-height 100vh, flex column, justify-content flex-end
 *   padding: calc(--space-xl + 60px) --frame --space-l
 * - .hero-slides: position absolute inset 0
 * - .hero-slide: opacity transition 1s, .active/.prev states
 * - .hero-slide-bg: inset -20px, grayscale(100%) contrast(1.1), Ken Burns 20s
 * - .hero-slide-overlay: gradient to top (ground → white/0.7 → white/0.3)
 * - .hero-content: z-index 10, grid 1fr 400px, gap --space-l, align-items end
 * - .hero-title: text-hero (clamp 3rem,12vw,10rem), weight 900, line-height 0.85,
 *   uppercase, letter-spacing -0.03em
 * - .hero-info: opacity 0 → 1, translateY 30 → 0, animation delay 0.6s
 * - .hero-nav: position absolute, bottom --space-l, right --frame, z-index 20
 * - .hero-nav-dot: 40px×4px (60px when active), progress animation 6s linear
 * - .scroll-indicator: position absolute, bottom --space-l, left --frame, z-index 20
 *
 * Animations:
 * - heroZoom: scale 1 → 1.05 → 1 (20s infinite)
 * - glitch: 0.3s transform/filter pulse on slide change
 * - scrambleText: 30ms interval, iteration += 1/3
 * - slideProgress: scaleX 0 → 1 (6s linear)
 * - scrollPulse: translateX -100% → 100% (1.5s infinite)
 *
 * Fonts: Inter 400/500/600/700/900 via @expo-google-fonts/inter
 */
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

import type { EventSummary } from "@domain/repositories/event.repository";
import { eventImage } from "@domain/rules/event-image";
import { formatDateID } from "@domain/services/date-format";
import {
  v2Colors,
  v2Borders,
  v2Easing,
  interFonts,
} from "@presentation/theme";
import { useResponsive } from "@presentation/hooks/useResponsive";

// ═══════════════════════════════════════
// CONSTANTS (from prototype CSS variables)
// ═══════════════════════════════════════
const EASE = Easing.bezier(...v2Easing.primary);
const SLIDE_DURATION_MS = 6000; // slideProgress 6s
const FADE_DURATION_MS = 1000; // opacity 1s transition
const ZOOM_DURATION_MS = 20000; // heroZoom 20s
const SCRAMBLE_INTERVAL_MS = 30; // scrambleText 30ms
const SCROLL_INDICATOR_DELAY_MS = 1500; // fadeIn delay 1.5s
const INFO_FADE_DELAY_MS = 600; // .hero-info animation delay 0.6s
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const isWeb = Platform.OS === "web";

// Prototype CSS variables:
// --frame: clamp(1rem, 4vw, 3rem) ≈ 24-48px
// --space-xs: 0.5rem = 8px
// --space-s: 1rem = 16px
// --space-m: 1.5rem = 24px
// --space-l: 3rem = 48px
// --space-xl: 5rem = 80px
// --text-xs: 0.75rem = 12px
// --text-s: 0.875rem = 14px
// --text-m: 1rem = 16px
// --text-l: 1.25rem = 20px
// --text-xl: clamp(1.5rem, 3vw, 2rem) ≈ 24-32px
// --text-hero: clamp(3rem, 12vw, 10rem) = 48-160px
const FRAME_PADDING = 24;
const SPACE_L = 48;
const SPACE_M = 24;
const SPACE_S = 16;
const SPACE_XS = 8;
const TEXT_HERO_MIN = 48;
const TEXT_HERO_MAX = 160;
const TEXT_XL = 32;
const TEXT_L = 20;
const TEXT_M = 16;
const TEXT_S = 14;
const TEXT_XS = 12;

export interface V2HeroCarouselProps {
  readonly events: readonly EventSummary[];
  readonly onBook: (eventId: string) => void;
  readonly onSeeAll: () => void;
  /** Mobile Home prototype uses one static featured hero. */
  readonly autoPlay?: boolean;
}

// ═══════════════════════════════════════
// SVG ICONS (from prototype - 18x18px stroke icons)
// ═══════════════════════════════════════
const ICON_SIZE = 18;

/** Calendar icon - prototype: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> */
function CalendarIcon({ color = v2Colors.ink }: { readonly color?: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={18} rx={2} stroke={color} strokeWidth={2} />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

/** Map pin icon - prototype: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> */
function MapPinIcon({ color = v2Colors.ink }: { readonly color?: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"
        stroke={color}
        strokeWidth={2}
      />
      <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

// ═══════════════════════════════════════
// TEXT SCRAMBLE HOOK (prototype scrambleText function)
// ═══════════════════════════════════════
function useTextScramble(text: string): string {
  const [displayText, setDisplayText] = useState(text);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const originalText = text;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) return originalText[index];
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3; // Prototype: iteration += 1/3
    }, SCRAMBLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [text, reducedMotion]);

  return displayText;
}

// ═══════════════════════════════════════
// HERO SLIDE (prototype .hero-slide)
// ═══════════════════════════════════════
function HeroSlide({
  uri,
  active,
  isPrev,
  isGlitching,
  zoomValue,
  reduced,
}: {
  readonly uri: string;
  readonly active: boolean;
  readonly isPrev: boolean;
  readonly isGlitching: boolean;
  readonly zoomValue: Animated.SharedValue<number>;
  readonly reduced: boolean;
}) {
  const opacity = useSharedValue(active || isPrev ? 1 : 0);
  const glitchX = useSharedValue(0);
  const glitchY = useSharedValue(0);

  // Opacity transition (1s)
  useEffect(() => {
    if (reduced) {
      opacity.value = active || isPrev ? 1 : 0;
      return;
    }
    opacity.value = withTiming(active || isPrev ? 1 : 0, {
      duration: FADE_DURATION_MS,
      easing: EASE,
    });
  }, [active, isPrev, reduced, opacity]);

  // Glitch effect (0.3s) on slide change
  useEffect(() => {
    if (!isGlitching || reduced) return;

    // Simulate glitch keyframes from prototype
    glitchX.value = withSequence(
      withTiming(-5, { duration: 60 }),
      withTiming(5, { duration: 60 }),
      withTiming(-3, { duration: 60 }),
      withTiming(3, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
    glitchY.value = withSequence(
      withTiming(5, { duration: 60 }),
      withTiming(-5, { duration: 60 }),
      withTiming(-3, { duration: 60 }),
      withTiming(3, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  }, [isGlitching, reduced, glitchX, glitchY]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    zIndex: active ? 1 : 0,
  }));

  // Ken Burns zoom (scale 1 → 1.05 → 1, 20s) + glitch transform
  const imageContainerStyle = useAnimatedStyle(() => {
    const scale = reduced ? 1 : interpolate(zoomValue.value, [0, 0.5, 1], [1, 1.05, 1]);
    return {
      transform: [{ scale }, { translateX: glitchX.value }, { translateY: glitchY.value }],
    };
  });

  // Web: CSS filter for grayscale (prototype: grayscale(100%) contrast(1.1))
  const webImageFilter = isWeb ? ({ filter: "grayscale(100%) contrast(1.1)" } as any) : {};

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          // inset: -20px for parallax overflow (prototype .hero-slide-bg)
          top: -20,
          left: -20,
          right: -20,
          bottom: -20,
        },
        containerStyle,
      ]}
    >
      <Animated.View style={[{ width: "100%", height: "100%" }, imageContainerStyle]}>
        <Image
          source={{ uri }}
          resizeMode="cover"
          style={[{ width: "100%", height: "100%" }, webImageFilter]}
          accessibilityIgnoresInvertColors
        />
      </Animated.View>

      {/* Native: grayscale approximation with stronger desaturation */}
      {!isWeb && (
        <>
          {/* Dark layer for contrast reduction */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#000000",
              opacity: 0.25,
            }}
          />
          {/* Gray layer for desaturation */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: v2Colors.inkMuted, // #666666 - per Design Palette Guide
              opacity: 0.65,
            }}
          />
        </>
      )}
    </Animated.View>
  );
}

// ═══════════════════════════════════════
// GRADIENT OVERLAY (prototype .hero-slide-overlay)
// Desktop (v2/01-home.html):
//   linear-gradient(to top, var(--ground) 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.3) 100%)
// Mobile (v2-mobile/01-home.html):
//   linear-gradient(to top, var(--ground) 0%, rgba(255,255,255,0.95) 30%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0.3) 100%)
//
// Use actual CSS linear-gradient on web, expo-linear-gradient on native.
// ═══════════════════════════════════════
function GradientOverlay({ isMobile = false }: { readonly isMobile?: boolean }) {
  // Web: use real CSS linear-gradient (exact match to prototype)
  const webGradientStyle = isWeb
    ? ({
        background: isMobile
          // Mobile prototype gradient: stronger fade at bottom for text readability
          ? `linear-gradient(to top, ${v2Colors.ground} 0%, rgba(255,255,255,0.95) 30%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0.3) 100%)`
          // Desktop prototype gradient
          : `linear-gradient(to top, ${v2Colors.ground} 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.3) 100%)`,
      } as any)
    : null;

  // Native: use expo-linear-gradient for smooth gradient (no more banding)
  if (!isWeb) {
    // Mobile prototype: var(--ground) 0% → 0.95 30% → 0.7 60% → 0.3 100%
    // "to top" in CSS = start from bottom, so we reverse the colors array (top → bottom)
    // and use locations from top (0) to bottom (1)
    return (
      <LinearGradient
        // Gradient from top to bottom (CSS "to top" reversed for RN)
        colors={[
          "rgba(255,255,255,0.3)",   // top (100% in CSS)
          "rgba(255,255,255,0.7)",   // 60% point in CSS → 0.4 from top
          "rgba(255,255,255,0.95)",  // 30% point in CSS → 0.7 from top
          v2Colors.ground,            // bottom (0% in CSS)
        ]}
        locations={[0, 0.4, 0.7, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
        }}
        pointerEvents="none"
      />
    );
  }

  // Web: single div with CSS gradient
  return (
    <View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
        },
        webGradientStyle,
      ]}
      pointerEvents="none"
    />
  );
}

// ═══════════════════════════════════════
// HERO TITLE (prototype .hero-title + scrambleText)
// ═══════════════════════════════════════
function HeroTitle({ name }: { readonly name: string }) {
  const displayText = useTextScramble(name);
  const { width } = useWindowDimensions();

  // Responsive font size: clamp(3rem, 12vw, 10rem)
  // 3rem = 48px, 10rem = 160px, 12vw at 1200px = 144px
  const fontSize = Math.min(Math.max(TEXT_HERO_MIN, width * 0.12), TEXT_HERO_MAX);

  return (
    <Text
      accessibilityRole="header"
      style={{
        color: v2Colors.ink,
        fontSize,
        fontFamily: interFonts.black, // Inter 900
        lineHeight: fontSize * 0.85, // line-height: 0.85
        textTransform: "uppercase",
        letterSpacing: fontSize * -0.03, // letter-spacing: -0.03em
      }}
    >
      {displayText}
    </Text>
  );
}

// ═══════════════════════════════════════
// COUNTDOWN TIMER (prototype .hero-countdown)
// ═══════════════════════════════════════
function CountdownTimer({ targetDate }: { readonly targetDate: Date }) {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = Math.max(0, targetDate.getTime() - now.getTime());
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <View
      style={{
        flexDirection: "row",
        gap: SPACE_S,
        backgroundColor: v2Colors.ink,
        padding: SPACE_S,
        alignSelf: "flex-start",
        marginBottom: SPACE_M,
      }}
    >
      {[
        { value: pad(time.days), label: "Hari" },
        { value: pad(time.hours), label: "Jam" },
        { value: pad(time.mins), label: "Menit" },
        { value: pad(time.secs), label: "Detik" },
      ].map((item) => (
        <View key={item.label} style={{ alignItems: "center", minWidth: 50 }}>
          <Text
            style={{
              color: v2Colors.ground,
              fontSize: TEXT_XL,
              fontFamily: interFonts.black, // weight 900
              fontVariant: ["tabular-nums"],
            }}
          >
            {item.value}
          </Text>
          <Text
            style={{
              color: v2Colors.ground,
              opacity: 0.7,
              fontSize: TEXT_XS,
              fontFamily: interFonts.medium, // weight 500
              textTransform: "uppercase",
              letterSpacing: 1.6, // letter-spacing: 0.1em = 1.6px at 16px
            }}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ═══════════════════════════════════════
// HERO INFO (prototype .hero-info with fadeUp animation) — Desktop/Web
// ═══════════════════════════════════════
function HeroInfo({
  event,
  targetDate,
  onBook,
  onSeeAll,
}: {
  readonly event: EventSummary;
  readonly targetDate: Date;
  readonly onBook: (eventId: string) => void;
  readonly onSeeAll: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  // fadeUp animation: opacity 0 → 1, translateY 30 → 0, 0.6s delay
  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = 0;
    translateY.value = 30;

    opacity.value = withDelay(INFO_FADE_DELAY_MS, withTiming(1, { duration: 800, easing: EASE }));
    translateY.value = withDelay(INFO_FADE_DELAY_MS, withTiming(0, { duration: 800, easing: EASE }));
  }, [event.id, reducedMotion, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Tagline from prototype (each slide has its own tagline)
  const tagline = "Pengalaman konser tak terlupakan.";

  return (
    <Animated.View key={event.id} style={animatedStyle}>
      {/* Tagline (prototype .hero-tagline) */}
      <Text
        style={{
          color: v2Colors.ink,
          fontSize: TEXT_L,
          fontFamily: interFonts.medium, // weight 500
          marginBottom: SPACE_M,
          maxWidth: 320,
        }}
      >
        {tagline}
      </Text>

      {/* Countdown */}
      <CountdownTimer targetDate={targetDate} />

      {/* Meta info (prototype .hero-meta) */}
      <View style={{ gap: SPACE_XS, marginBottom: SPACE_S }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE_XS }}>
          <CalendarIcon />
          <Text
            style={{
              color: v2Colors.ink,
              fontSize: TEXT_M,
              fontFamily: interFonts.medium, // weight 500
            }}
          >
            {formatDateID(event.startsAt)}
          </Text>
        </View>
        {event.venue && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE_XS }}>
            <MapPinIcon />
            <Text
              style={{
                color: v2Colors.ink,
                fontSize: TEXT_M,
                fontFamily: interFonts.medium, // weight 500
              }}
            >
              {event.venue}
            </Text>
          </View>
        )}
      </View>

      {/* Price (prototype .hero-price) */}
      <Text
        style={{
          color: v2Colors.ink,
          fontSize: TEXT_XL,
          fontFamily: interFonts.black, // weight 900
          marginBottom: SPACE_M,
        }}
      >
        Mulai <Text style={{ fontFamily: interFonts.black }}>Rp {((event.minPriceMinor ?? 0) / 100).toLocaleString("id-ID")}</Text>
      </Text>

      {/* CTAs (prototype .hero-cta) */}
      <View style={{ flexDirection: "row", gap: SPACE_XS, flexWrap: "wrap" }}>
        {/* Primary: Beli Tiket (prototype .btn-primary .btn-large) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Beli tiket ${event.name}`}
          testID="hero-book"
          onPress={() => onBook(event.id)}
          style={{
            backgroundColor: v2Colors.ink,
            borderWidth: v2Borders.standard,
            borderColor: v2Colors.ink,
            paddingVertical: 16, // .btn-large: 1rem
            paddingHorizontal: 32, // .btn-large: 2rem
          }}
        >
          <Text
            style={{
              color: v2Colors.ground,
              fontSize: TEXT_M,
              fontFamily: interFonts.bold, // weight 700
              textTransform: "uppercase",
              letterSpacing: 0.64, // 0.04em at 16px
            }}
          >
            Beli Tiket
          </Text>
        </Pressable>

        {/* Secondary: Lihat Detail (prototype .btn-ghost .btn-large) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lihat detail event"
          testID="hero-detail"
          onPress={() => onBook(event.id)}
          style={{
            backgroundColor: v2Colors.ground,
            borderWidth: v2Borders.standard,
            borderColor: v2Colors.ink,
            paddingVertical: 16,
            paddingHorizontal: 32,
          }}
        >
          <Text
            style={{
              color: v2Colors.ink,
              fontSize: TEXT_M,
              fontFamily: interFonts.bold, // weight 700
              textTransform: "uppercase",
              letterSpacing: 0.64,
            }}
          >
            Lihat Detail
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ═══════════════════════════════════════
// HERO INFO MOBILE (v2-mobile/01-home.html prototype)
// Simpler layout: Badge + Title + Meta + Single CTA
// NO countdown, NO price, NO tagline, NO secondary button
// ═══════════════════════════════════════

/** Pulsing red dot for "ON SALE NOW" badge */
function PulsingDot() {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacityVal = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) return;
    // liveDot animation: scale 1 → 1.3, opacity 1 → 0.7 (1s infinite)
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    opacityVal.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacityVal);
    };
  }, [reducedMotion, scale, opacityVal]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacityVal.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: "#ff0000", // --danger
        },
        dotStyle,
      ]}
    />
  );
}

/** Arrow icon for CTA button */
function ArrowIcon({ color = v2Colors.ground }: { readonly color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth={2.5} />
    </Svg>
  );
}

function HeroInfoMobile({
  event,
  onBook,
}: {
  readonly event: EventSummary;
  readonly onBook: (eventId: string) => void;
}) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const { width } = useWindowDimensions();
  
  // Text scramble animation for title (like desktop)
  const displayTitle = useTextScramble(event.name);

  // fadeSlideUp animation from prototype: 0.6s delay after loader exit
  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = 0;
    translateY.value = 30;

    opacity.value = withDelay(INFO_FADE_DELAY_MS, withTiming(1, { duration: 600, easing: EASE }));
    translateY.value = withDelay(INFO_FADE_DELAY_MS, withTiming(0, { duration: 600, easing: EASE }));
  }, [event.id, reducedMotion, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Mobile title size: smaller than desktop - clamp(2rem, 10vw, 3rem) = 32-48px
  // Reduced from original 40-64px for better mobile fit
  const titleFontSize = Math.min(Math.max(32, width * 0.10), 48);

  return (
    <Animated.View key={event.id} style={animatedStyle}>
      {/* Badge: "ON SALE NOW" with pulsing red dot */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: v2Colors.ink,
          paddingVertical: 8,
          paddingHorizontal: 12,
          alignSelf: "flex-start",
          marginBottom: SPACE_S,
        }}
      >
        <PulsingDot />
        <Text
          style={{
            color: v2Colors.ground,
            fontSize: TEXT_XS,
            fontFamily: interFonts.bold, // weight 700
            textTransform: "uppercase",
            letterSpacing: 0.6, // 0.05em at 12px
          }}
        >
          Sedang Dijual
        </Text>
      </View>

      {/* Title: Large brutalist text */}
      <Text
        accessibilityRole="header"
        style={{
          color: v2Colors.ink,
          fontSize: titleFontSize,
          fontFamily: interFonts.black, // weight 900
          lineHeight: titleFontSize * 1.1, // line-height: 1.1 to prevent top clipping
          textTransform: "uppercase",
          letterSpacing: titleFontSize * -0.02, // letter-spacing: -0.02em
          marginBottom: SPACE_S,
        }}
      >
        {displayTitle}
      </Text>

      {/* Meta: Date · Venue (compact, single line with wrap) */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: SPACE_S,
          marginBottom: SPACE_M,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <CalendarIcon color={v2Colors.inkMuted} />
          <Text
            style={{
              color: v2Colors.inkMuted,
              fontSize: TEXT_S,
              fontFamily: interFonts.regular, // weight 400
            }}
          >
            {formatDateID(event.startsAt)}
          </Text>
        </View>
        {event.venue && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <MapPinIcon color={v2Colors.inkMuted} />
            <Text
              style={{
                color: v2Colors.inkMuted,
                fontSize: TEXT_S,
                fontFamily: interFonts.regular, // weight 400
              }}
            >
              {event.venue}
            </Text>
          </View>
        )}
      </View>

      {/* Single CTA: "GET TICKETS →" (no secondary button on mobile) */}
      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: v2Colors.ink,
          borderWidth: v2Borders.standard,
          borderColor: v2Colors.ink,
          shadowColor: v2Colors.ink,
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
        }}
      >
       <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Beli tiket untuk ${event.name}`}
        testID="hero-book"
        onPress={() => onBook(event.id)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          backgroundColor: v2Colors.ink,
          paddingVertical: 14,
          paddingHorizontal: 24,
          minHeight: 44,
        }}
      >
        <Text
          style={{
            color: v2Colors.ground,
            fontSize: TEXT_S,
            fontFamily: interFonts.bold, // weight 700
            textTransform: "uppercase",
            letterSpacing: 0.56, // 0.04em at 14px
          }}
        >
          Beli Tiket
        </Text>
        <ArrowIcon />
       </Pressable>
      </View>
    </Animated.View>
  );
}

// ═══════════════════════════════════════
// NAV DOT (prototype .hero-nav-dot with progress animation)
// ═══════════════════════════════════════
function NavDot({
  isActive,
  onPress,
  index,
}: {
  readonly isActive: boolean;
  readonly onPress: () => void;
  readonly index: number;
}) {
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  // Progress animation: scaleX 0 → 1 (6s linear)
  useEffect(() => {
    if (!isActive) {
      progress.value = 0;
      return;
    }
    if (reducedMotion) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: SLIDE_DURATION_MS,
      easing: Easing.linear,
    });
  }, [isActive, reducedMotion, progress]);

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`Slide ${index + 1}`}
      onPress={onPress}
      style={{
        width: isActive ? 60 : 40, // active: 60px, default: 40px
        height: 4,
        backgroundColor: v2Colors.inkMuted,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Fill (slides in on active) */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: v2Colors.ink,
            transformOrigin: "left",
          },
          isActive ? progressStyle : { transform: [{ scaleX: 0 }] },
        ]}
      />
    </Pressable>
  );
}

// ═══════════════════════════════════════
// SLIDE DOTS (prototype .hero-nav)
// ═══════════════════════════════════════
function SlideDots({
  count,
  current,
  onSelect,
}: {
  readonly count: number;
  readonly current: number;
  readonly onSelect: (index: number) => void;
}) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: SPACE_L,
        right: FRAME_PADDING,
        flexDirection: "row",
        gap: 4,
        zIndex: 20,
      }}
      accessibilityRole="tablist"
    >
      {Array.from({ length: count }, (_, i) => (
        <NavDot key={i} index={i} isActive={i === current} onPress={() => onSelect(i)} />
      ))}
    </View>
  );
}

// ═══════════════════════════════════════
// SCROLL INDICATOR (prototype .scroll-indicator)
// ═══════════════════════════════════════
function ScrollIndicator() {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const pulse = useSharedValue(0);

  // Fade in with 1.5s delay
  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 1;
      return;
    }
    opacity.value = withDelay(SCROLL_INDICATOR_DELAY_MS, withTiming(1, { duration: 1000, easing: EASE }));
  }, [reducedMotion, opacity]);

  // Scroll pulse animation: translateX -100% → 100% (1.5s infinite)
  useEffect(() => {
    if (reducedMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(pulse);
  }, [reducedMotion, pulse]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(pulse.value, [0, 0.5, 1], [-40, 40, -40]) }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: SPACE_L,
          left: FRAME_PADDING,
          flexDirection: "row",
          alignItems: "center",
          gap: SPACE_S,
          zIndex: 20,
        },
        containerStyle,
      ]}
    >
      <View
        style={{
          width: 40,
          height: 2,
          backgroundColor: v2Colors.ink,
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: v2Colors.inkMuted,
            },
            lineStyle,
          ]}
        />
      </View>
      <Text
        style={{
          color: v2Colors.ink,
          fontSize: TEXT_S,
          fontFamily: interFonts.semiBold, // weight 600
          textTransform: "uppercase",
          letterSpacing: 1.6, // 0.1em at 16px = 1.6px
        }}
      >
        Gulir
      </Text>
    </Animated.View>
  );
}

// ═══════════════════════════════════════
// MAIN COMPONENT (prototype .hero)
// ═══════════════════════════════════════
export function V2HeroCarousel({ events, onBook, onSeeAll, autoPlay = true }: V2HeroCarouselProps) {
  const reducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [glitchIndex, setGlitchIndex] = useState<number | null>(null);
  const top = events.slice(0, autoPlay ? 3 : 1);
  const zoom = useSharedValue(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { width: screenWidth, height: screenHeight, heroHeightVh, isNative } = useResponsive();

  // Viewport height: 70vh on mobile/native, 100vh on desktop web
  // v2-mobile prototype: .hero { min-height: 70vh }
  // v2 desktop prototype: .hero { min-height: 100vh }
  const heroHeight = Math.max(480, (screenHeight * heroHeightVh) / 100);

  // Responsive: single column on narrow screens (<900px per prototype @media query)
  // For native: ALWAYS use mobile layout regardless of screen width
  const isNarrow = screenWidth < 900 || isNative;

  // Ken Burns zoom loop (20s): scale 1 → 1.05 → 1
  useEffect(() => {
    if (reducedMotion) return;
    zoom.value = withRepeat(
      withTiming(1, { duration: ZOOM_DURATION_MS, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
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
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay, reducedMotion, top.length]);

  const handleDotPress = (index: number) => {
    showSlide(index);
    // Reset timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      if (top.length > 1) {
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
      }
    }
  };

  const currentEvent = top[currentIndex];
  if (!currentEvent) return null;

  // Target date for countdown (desktop only)
  const targetDate = new Date(currentEvent.startsAt ?? Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <View
      style={{
        minHeight: heroHeight,
        position: "relative",
        overflow: "hidden",
      }}
      testID="v2-hero"
    >
      {/* Background slides (prototype .hero-slides) */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        {top.map((ev, i) => (
          <HeroSlide
            key={ev.id}
            uri={eventImage(ev.id)}
            active={i === currentIndex}
            isPrev={i === prevIndex}
            isGlitching={i === glitchIndex}
            zoomValue={zoom}
            reduced={reducedMotion ?? false}
          />
        ))}
      </View>

      {/* Gradient overlay (prototype .hero-slide-overlay) */}
      <GradientOverlay isMobile={isNative} />

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
      <View
        style={{
          position: "absolute",
          bottom: isNative ? SPACE_L : SPACE_L + 40, // Native: no extra room for dots at bottom
          left: FRAME_PADDING,
          right: FRAME_PADDING,
          zIndex: 10,
          // Desktop: row layout with title + info side by side
          // Native: single column (mobile prototype has Badge→Title→Meta→CTA stacked)
          flexDirection: isNative ? "column" : isNarrow ? "column" : "row",
          gap: isNarrow ? SPACE_M : SPACE_L,
          alignItems: isNarrow ? "flex-start" : "flex-end",
        }}
      >
        {/* 
          Native (mobile): Use HeroInfoMobile which includes the title
          Web/Desktop: Separate title column + HeroInfo column
        */}
        {isNative ? (
          // Mobile: Single stacked component with Badge + Title + Meta + CTA
          <HeroInfoMobile event={currentEvent} onBook={onBook} />
        ) : (
          <>
            {/* Left column: Title (flex: 1, aligned to bottom) */}
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              <HeroTitle name={currentEvent.name} />
            </View>

            {/* Right column: Info (fixed 400px width on desktop) */}
            <View style={isNarrow ? { width: "100%" } : { width: 400 }}>
              <HeroInfo event={currentEvent} targetDate={targetDate} onBook={onBook} onSeeAll={onSeeAll} />
            </View>
          </>
        )}
      </View>

      {/* Navigation dots (prototype .hero-nav) - bottom right */}
      {/* On native mobile: hide dots for cleaner look per v2-mobile prototype (no carousel nav) */}
      {!isNative && top.length > 1 && <SlideDots count={top.length} current={currentIndex} onSelect={handleDotPress} />}

      {/* Scroll indicator (prototype .scroll-indicator) - bottom left, desktop only */}
      {!isNarrow && <ScrollIndicator />}
    </View>
  );
}

export default V2HeroCarousel;
