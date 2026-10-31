/**
 * HeroCarousel — 1:1 of the prototype index.html `.hero`.
 *
 * Reproduces: full-bleed photo SLIDES that crossfade (opacity 1.2s) with a Ken
 * Burns zoom (scale 1.08→1.18 over 6s), auto-advance every 4200ms, the dark
 * scrim gradient, the drifting red/ember aura, the stroked marquee text, the
 * "Live · Flash Sale" eyebrow with a pulsing dot, the slide title + 📍/🗓 meta,
 * the "Booking Sekarang" (red pin) + "Lihat Semua" actions, and the dots
 * (active = 26px red). All animation is Reanimated and honors reduced-motion
 * (static first slide, no loops) exactly like the prototype's media query.
 */
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, type ReactNode } from "react";
import { ImageBackground, Pressable, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import type { EventSummary } from "@domain/repositories/event.repository";
import { eventImage } from "@domain/rules/event-image";
import { formatDateID } from "@domain/services/date-format";
import { brand } from "@presentation/theme";

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const SLIDE_MS = 4200;
const FADE_MS = 1200;

/** Absolute-fill (RN has no `inset` shorthand). */
const FILL = { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };

export interface HeroCarouselProps {
  readonly events: readonly EventSummary[];
  readonly onBook: (eventId: string) => void;
  readonly onSeeAll: () => void;
  /** Home scroll offset (shared value) — drives the hero parallax. Optional. */
  readonly scrollY?: SharedValue<number>;
}

export function HeroCarousel({ events, onBook, onSeeAll, scrollY }: HeroCarouselProps) {
  const top = events.slice(0, 3);
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  // `index` crossfades slides; `pulse` drives the live dot; `drift` the aura;
  // `intro` drives the cinematic staggered entrance on mount.
  const index = useSharedValue(0);
  const current = useSharedValue(0); // integer index for text/dots
  const pulse = useSharedValue(0);
  const zoom = useSharedValue(0);
  const intro = useSharedValue(0);

  const n = top.length;
  // Prototype: `.hero { min-height:100dvh }`; `@media(max-width:720px)` →
  // `min-height:760px`. On phone widths (and the 393×852 proto viewport) the
  // 760px mobile value is the faithful height.
  const heroHeight = (width || 393) <= 720 ? 760 : Math.max(760, Math.round((width || 393) * 0.92));

  useEffect(() => {
    if (reduced) {
      index.value = 0;
      intro.value = 1;
      return;
    }
    // Cinematic entrance: content eases up + in over ~1s (supahero-style
    // staggered reveal is applied per-child via `intro` + each child's delay).
    intro.value = withTiming(1, { duration: 1000, easing: EASE });
    if (n <= 1) {
      index.value = 0;
      // Still run the ambient loops (Ken Burns + pulse) on a single slide.
      zoom.value = withRepeat(withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.quad) }), -1, true);
      pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.linear }), -1, false);
      return () => {
        cancelAnimation(zoom);
        cancelAnimation(pulse);
      };
    }
    // Slow continuous Ken Burns zoom + live-dot pulse loops.
    zoom.value = withRepeat(withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.quad) }), -1, true);
    pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.linear }), -1, false);

    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % n;
      current.value = i;
      index.value = withTiming(i, { duration: FADE_MS, easing: EASE });
    }, SLIDE_MS);
    return () => {
      clearInterval(id);
      cancelAnimation(index);
      cancelAnimation(zoom);
      cancelAnimation(pulse);
    };
  }, [reduced, n, index, current, zoom, pulse, intro]);

  if (!top[0]) return null;

  return (
    <View
      // Prototype `.hero` is full-bleed (min-height:100dvh/760px, NO radius) —
      // the rounded corners belong to the event cards, not the hero.
      className="overflow-hidden bg-ink"
      style={{ height: heroHeight }}
      testID="home-hero"
    >
      {/* Photo slides (crossfade + Ken Burns + scroll parallax). */}
      {top.map((ev, i) => (
        <HeroSlide key={ev.id} uri={eventImage(ev.id)} i={i} index={index} zoom={zoom} reduced={reduced} scrollY={scrollY} />
      ))}

      {/* Scrim gradient (prototype .hero-scrim). */}
      <LinearGradient
        colors={["rgba(10,10,12,0.35)", "rgba(10,10,12,0.2)", "rgba(10,10,12,0.78)", "rgba(10,10,12,0.96)"]}
        locations={[0, 0.38, 0.82, 1]}
        style={FILL}
      />
      {/* Drifting aura (prototype .hero-aura). */}
      <AuraGlow reduced={reduced} />

      {/* Content, bottom-aligned (prototype .hero align-items:flex-end;
          padding-bottom:40px mobile; .wrap padding 0 20px). */}
      <View
        className="flex-1 justify-end"
        style={{ paddingHorizontal: 20, paddingBottom: 40 }}
        pointerEvents="box-none"
      >
        {/* Eyebrow — in flow, ABOVE slide-txt (prototype .eyebrow). */}
        <IntroReveal intro={intro} delay={0}>
          <View className="flex-row">
            <View className="flex-row items-center gap-2 rounded-pill border border-white/[0.18] bg-white/10 px-3.5 py-1.75">
              <PulseDot pulse={pulse} />
              <Text className="text-2xs font-semibold uppercase tracking-tag text-white">
                Live · Flash Sale
              </Text>
            </View>
          </View>
        </IntroReveal>

        {/* slide-txt: relative 230px, margin-top:18, absolute inset-0 bodies. */}
        <IntroReveal intro={intro} delay={0.18}>
          <SlideText top={top} current={current} onBook={onBook} onSeeAll={onSeeAll} />
        </IntroReveal>

        {/* dots: margin-top:30. */}
        <IntroReveal intro={intro} delay={0.4}>
          <Dots count={n} current={current} />
        </IntroReveal>
      </View>
    </View>
  );
}

/**
 * IntroReveal — cinematic staggered entrance (supahero-style). As `intro`
 * sweeps 0→1 on mount, each child reveals within its own [delay, delay+window]
 * slice: fade in, rise 24px, and settle from a 0.98 scale. Reduced-motion
 * leaves `intro` pinned at 1 (instant, no transform).
 */
function IntroReveal({
  intro,
  delay,
  children,
}: {
  readonly intro: SharedValue<number>;
  readonly delay: number;
  readonly children: ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    const window = 0.6; // each child animates across 60% of the timeline
    const local = Math.max(0, Math.min(1, (intro.value - delay) / window));
    return {
      opacity: local,
      transform: [
        { translateY: (1 - local) * 24 },
        { scale: 0.98 + local * 0.02 },
      ],
    };
  });
  return <Animated.View style={style}>{children}</Animated.View>;
}

function HeroSlide({
  uri,
  i,
  index,
  zoom,
  reduced,
  scrollY,
}: {
  readonly uri: string;
  readonly i: number;
  readonly index: SharedValue<number>;
  readonly zoom: SharedValue<number>;
  readonly reduced: boolean;
  readonly scrollY?: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    // Opacity peaks when `index` ≈ i (crossfade), 0 otherwise.
    const dist = Math.abs(index.value - i);
    const opacity = reduced ? (i === 0 ? 1 : 0) : Math.max(0, 1 - dist);
    const scale = reduced ? 1.08 : interpolate(zoom.value, [0, 1], [1.08, 1.18]);
    // Parallax: as the page scrolls up, the photo sinks at ~0.35× (stays in
    // frame longer than the content), the classic hero-parallax feel. Disabled
    // under reduced-motion and when no scroll source is wired.
    const sy = scrollY ? scrollY.value : 0;
    const parallax = reduced ? 0 : Math.max(0, sy) * 0.35;
    return { opacity, transform: [{ translateY: parallax }, { scale }] };
  });
  return (
    <Animated.View style={[FILL, style]}>
      <ImageBackground source={{ uri }} resizeMode="cover" style={{ flex: 1 }} />
    </Animated.View>
  );
}

function AuraGlow({ reduced }: { readonly reduced: boolean }) {
  const drift = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    drift.value = withRepeat(withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(drift);
  }, [reduced, drift]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.5,
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [-12, 20]) },
      { translateY: interpolate(drift.value, [0, 1], [-8, 16]) },
      { scale: interpolate(drift.value, [0, 1], [1.05, 1.2]) },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: "absolute", top: "-25%", left: "-25%", right: "-25%", bottom: "-25%" }, style]}
    >
      <LinearGradient
        colors={["#ff2d3f", "transparent"]}
        start={{ x: 0.24, y: 0.32 }}
        end={{ x: 0.9, y: 1 }}
        style={FILL}
      />
      <LinearGradient
        colors={["#ff5a2d", "transparent"]}
        start={{ x: 0.8, y: 0.26 }}
        end={{ x: 0.1, y: 1 }}
        style={[FILL, { opacity: 0.8 }]}
      />
    </Animated.View>
  );
}

function PulseDot({ pulse }: { readonly pulse: SharedValue<number> }) {
  const ring = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 0.7, 1], [0.6, 0, 0]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 3]) }],
  }));
  return (
    <View style={{ width: 7, height: 7, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[
          { position: "absolute", width: 7, height: 7, borderRadius: 999, backgroundColor: "#ff3b4e" },
          ring,
        ]}
      />
      <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: "#ff3b4e" }} />
    </View>
  );
}

function SlideText({
  top,
  current,
  onBook,
  onSeeAll,
}: {
  readonly top: readonly EventSummary[];
  readonly current: SharedValue<number>;
  readonly onBook: (eventId: string) => void;
  readonly onSeeAll: () => void;
}) {
  return (
    <View style={{ minHeight: 230, marginTop: 18 }}>
      {top.map((ev, i) => (
        <SlideBody key={ev.id} ev={ev} i={i} current={current} onBook={onBook} onSeeAll={onSeeAll} />
      ))}
    </View>
  );
}

function SlideBody({
  ev,
  i,
  current,
  onBook,
  onSeeAll,
}: {
  readonly ev: EventSummary;
  readonly i: number;
  readonly current: SharedValue<number>;
  readonly onBook: (eventId: string) => void;
  readonly onSeeAll: () => void;
}) {
  const style = useAnimatedStyle(() => {
    const on = Math.round(current.value) === i;
    return {
      opacity: withTiming(on ? 1 : 0, { duration: 500 }),
      transform: [{ translateY: withTiming(on ? 0 : 18, { duration: 500 }) }],
    };
  });
  const dateTxt = formatDateID(ev.startsAt);
  return (
    <Animated.View
      // Top-anchored (prototype .slide-body { inset:0 }) so h1 → meta →
      // actions flow downward inside the 230px slide-txt box.
      style={[{ position: "absolute", top: 0, left: 0, right: 0 } as object, style]}
      pointerEvents={i === 0 ? "box-none" : "none"}
    >
      <Text
        className="font-extrabold text-white"
        style={{ fontSize: 40, lineHeight: 40, letterSpacing: -1.4, maxWidth: "80%" }}
        accessibilityRole="header"
        numberOfLines={2}
      >
        {ev.name}
      </Text>
      <View className="mt-3.5 flex-row flex-wrap gap-3.5">
        {ev.venue ? <Text className="text-md text-white/80">📍 {ev.venue}</Text> : null}
        {dateTxt ? <Text className="text-md text-white/80">🗓 {dateTxt}</Text> : null}
      </View>
      <View className="mt-6 flex-row flex-wrap items-center gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Booking ${ev.name} sekarang`}
          onPress={() => onBook(ev.id)}
          testID="hero-book"
          style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 26, paddingRight: 11 }}
          className="flex-row items-center gap-[13px] rounded-pill bg-white shadow-button"
        >
          <Text className="text-md font-bold text-ink">Booking Sekarang</Text>
          <View
            style={{ width: 34, height: 34 }}
            className="items-center justify-center rounded-full bg-brand"
          >
            <Text className="text-md text-white" accessibilityElementsHidden>↗</Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lihat semua event"
          onPress={onSeeAll}
          testID="hero-see-all"
          style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 24, paddingRight: 24 }}
          className="rounded-pill border border-white/20 bg-white/10"
        >
          <Text className="text-md font-semibold text-white">Lihat Semua</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function Dots({ count, current }: { readonly count: number; readonly current: SharedValue<number> }) {
  if (count <= 1) return null;
  return (
    <View className="mt-7.5 flex-row gap-2" accessibilityElementsHidden>
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} i={i} current={current} />
      ))}
    </View>
  );
}

function Dot({ i, current }: { readonly i: number; readonly current: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const on = Math.round(current.value) === i;
    return {
      width: withTiming(on ? 26 : 8, { duration: 500, easing: EASE }),
      backgroundColor: on ? brand.red : "rgba(255,255,255,0.28)",
    };
  });
  return <Animated.View style={[{ height: 8, borderRadius: 999 }, style]} />;
}
