/**
 * Home PageScreen (folder index) — parent component (orchestration only).
 *
 * 1:1 of the prototype index.html. Wiring: useEvents (TanStack) → ListEvents →
 * ports → mock. Owns the scroll ref + parallax shared value, the in-page scroll
 * targets, the login/filter modal state, and the filter→/browse navigation.
 * Markup → ./fragments, styles → ./style, types → ./interface (refactor rule).
 */
import { useRouter, type Href } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FilterModal, type FilterValue } from "@presentation/components/FilterModal";
import { LoginModal } from "@presentation/components/LoginModal";
import { HeroCarousel } from "@presentation/components/home/HeroCarousel";
import { TrustStrip } from "@presentation/components/home/TrustStrip";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useEvents } from "@presentation/hooks/useEvents";
import { useResponsive } from "@presentation/hooks/useResponsive";

import { HomeNav } from "./fragments/HomeNav";
import { HomeSections } from "./fragments/HomeSections";
import { HomeError, HomeLoading } from "./fragments/HomeStates";
import { homeScrollContent } from "./style";

export function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useEvents();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const featuredY = useRef(0);
  const historyY = useRef(0);
  const { isWeb, isDesktop, width, gridColumns } = useResponsive();
  const insets = useSafeAreaInsets();
  // Prototype breakpoint: nav center links show > 720px (desktop web only).
  const showNavLinks = isWeb && width > 720;
  // Scroll offset drives the hero parallax (background sinks slower than scroll).
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // Modals (prototype: CTA → login modal; Filter → filter popup). No direct nav.
  const [loginOpen, setLoginOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const goToEvent = (eventId: string): void => router.push(`/events/${eventId}` as Href);
  const scrollToFeatured = (): void =>
    scrollRef.current?.scrollTo({ y: featuredY.current, animated: true });
  const scrollToHistory = (): void =>
    scrollRef.current?.scrollTo({ y: historyY.current, animated: true });

  // Filter "Terapkan" → /browse with the chosen params (prototype submit →
  // browse.html?<params>).
  const applyFilter = (f: FilterValue): void => {
    setFilterOpen(false);
    const qs = new URLSearchParams({ genre: f.genre, time: f.time, sort: f.sort }).toString();
    router.push(`/browse?${qs}` as Href);
  };

  return (
    <ScreenFade>
      <View className="flex-1 bg-background">
        <Animated.ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={homeScrollContent(insets.bottom)}
          onScroll={onScroll}
          scrollEventThrottle={16}
          testID="home-scroll"
        >
          {isLoading ? <HomeLoading /> : null}
          {isError ? <HomeError message={error?.message} /> : null}

          {data && data.upcoming.length > 0 ? (
            <HeroCarousel
              events={data.upcoming}
              onBook={goToEvent}
              onSeeAll={scrollToFeatured}
              scrollY={scrollY}
            />
          ) : null}

          {data ? <TrustStrip /> : null}

          {data ? (
            <HomeSections
              data={data}
              isDesktop={isDesktop}
              columns={gridColumns}
              onPressEvent={goToEvent}
              onFilter={() => setFilterOpen(true)}
              onFeaturedLayout={(y) => {
                featuredY.current = y;
              }}
              onHistoryLayout={(y) => {
                historyY.current = y;
              }}
            />
          ) : null}
        </Animated.ScrollView>

        <HomeNav
          showLinks={showNavLinks}
          width={width}
          topInset={insets.top}
          onJelajah={scrollToFeatured}
          onHistory={scrollToHistory}
          onKategori={scrollToHistory}
          onAccount={() => setLoginOpen(true)}
        />

        {/* Login/OTP + Filter modals (prototype index.html dialogs). */}
        <LoginModal visible={loginOpen} onClose={() => setLoginOpen(false)} />
        <FilterModal visible={filterOpen} onClose={() => setFilterOpen(false)} onApply={applyFilter} />
      </View>
    </ScreenFade>
  );
}
