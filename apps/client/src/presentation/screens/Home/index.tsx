/**
 * RBT-096 —  Brutalist Mono Home Screen (Re-implementation)
 *
 * 1:1 of prototype 01-home.html. MASTER-SPEC §3.1.
 *
 * PROTOTYPE RULES (non-negotiable):
 * - All images: grayscale(100%) by default, color pops on hover
 * - Hero: full viewport, Ken Burns zoom, glitch on slide change
 * - Cards: 3D tilt hover, badge slides from left
 * - Grid: 2px gap creates border effect (ink background)
 * - Header: slides in from top, fixed position
 * - All animations exactly as prototype
 */
import { useRouter, type Href } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoginModal } from "@presentation/components/auth/LoginModal";
import {
  FilterModal,
  type FilterValue,
} from "@presentation/components/FilterModal";
import {
  ToastProvider,
  Loader,
  ScrollProgress,
  Header,
  HeroCarousel,
  BottomNav,
} from "@presentation/components/design-system";
import { useEvents } from "@presentation/hooks/useEvents";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useAccountStore } from "@presentation/stores/account-store";

import { HomeSections } from "./fragments/HomeSections";
import { HomeError } from "./fragments/HomeStates";
import { homeScrollContent, componentStyles } from "./style";

export function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useEvents();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const {
    isWeb,
    isDesktop,
    isNative,
    isMobileWeb,
    width,
    headerHeight,
    gridColumns,
    bottomBarHeight,
  } = useResponsive();
  const insets = useSafeAreaInsets();
  const profile = useAccountStore((s) => s.profile);

  // Prototype breakpoint: nav center links show > 768px (desktop web only).
  const showNavLinks = isWeb && width > 768;

  // Bottom padding: account for bottom nav on native
  const bottomPadding = isNative
    ? bottomBarHeight + insets.bottom
    : insets.bottom;

  // Scroll offset drives the hero parallax + scroll progress.
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // Modals (prototype: CTA → login modal; Filter → filter popup).
  const [loginOpen, setLoginOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const goToEvent = (eventId: string): void =>
    router.push(`/events/${eventId}` as Href);
  const goBrowse = (): void => router.push("/browse" as Href);

  // Filter "Terapkan" → /browse with the chosen params.
  const applyFilter = (f: FilterValue): void => {
    setFilterOpen(false);
    const qs = new URLSearchParams({
      genre: f.genre,
      time: f.time,
      sort: f.sort,
    }).toString();
    router.push(`/browse?${qs}` as Href);
  };

  // Show loading screen (prototype loader with bouncing letters)
  if (isLoading) {
    return <Loader visible label="RUSUH" />;
  }

  return (
    <ToastProvider>
      <View style={componentStyles.elementFlex0}>
        {/* Scroll progress bar - fixed top (prototype .scroll-progress) */}
        {isWeb && <ScrollProgress />}

        <Animated.ScrollView
          ref={scrollRef}
          style={componentStyles.elementFlex1}
          contentContainerStyle={homeScrollContent(
            bottomPadding,
            isMobileWeb ? insets.top + headerHeight : 0,
          )}
          onScroll={onScroll}
          scrollEventThrottle={16}
          testID="home-scroll"
        >
          {isError && <HomeError message={error?.message} />}

          {/* Hero Carousel - Full viewport (prototype .hero) */}
          {data && data.upcoming.length > 0 && (
            <HeroCarousel
              events={data.upcoming.slice(0, 3)}
              onBook={goToEvent}
              onSeeAll={goBrowse}
              autoPlay
            />
          )}

          {/* Main sections: Events grid, Categories, Stats, How-to, Testimonials, Newsletter, Footer */}
          {data && (
            <HomeSections
              data={data}
              isDesktop={isDesktop}
              columns={gridColumns}
              onPressEvent={goToEvent}
              onFilter={() => setFilterOpen(true)}
              onSeeAll={goBrowse}
              onFeaturedLayout={() => undefined}
              onHistoryLayout={() => undefined}
              onNavigate={(href) => router.push(href as Href)}
            />
          )}
        </Animated.ScrollView>

        {/* Fixed Header - slides in from top (prototype .header) */}
        <Header
          topInset={insets.top}
          showLinks={showNavLinks}
          links={[
            {
              label: "Beranda",
              onPress: () =>
                scrollRef.current?.scrollTo({ y: 0, animated: true }),
              testID: "nav-home",
            },
            { label: "Jelajahi", onPress: goBrowse, testID: "nav-browse" },
            ...(profile
              ? [
                  {
                    label: "Tiket Saya",
                    onPress: () => router.push("/my-tickets" as Href),
                    testID: "nav-tickets",
                  },
                  {
                    label: "Profil",
                    onPress: () => router.push("/profile" as Href),
                    testID: "nav-profile",
                  },
                ]
              : []),
          ]}
          mobileMenuLinks={[
            {
              label: "Beranda",
              onPress: () =>
                scrollRef.current?.scrollTo({ y: 0, animated: true }),
              testID: "nav-home",
            },
            { label: "Cari Event", onPress: goBrowse, testID: "nav-browse" },
            {
              label: "Tiket Saya",
              onPress: () => router.push("/my-tickets" as Href),
              testID: "nav-tickets",
            },
            {
              label: "Arsip Event",
              onPress: () => router.push("/history" as Href),
              testID: "nav-history",
            },
            {
              label: "Profil",
              onPress: () => router.push("/profile" as Href),
              testID: "nav-profile",
            },
          ]}
          isLoggedIn={Boolean(profile)}
          onCtaPress={() => setLoginOpen(true)}
          onLogoPress={() =>
            scrollRef.current?.scrollTo({ y: 0, animated: true })
          }
          actions={[]}
        />

        {/* Login/OTP + Filter modals */}
        <LoginModal visible={loginOpen} onClose={() => setLoginOpen(false)} />
        <FilterModal
          visible={filterOpen}
          onClose={() => setFilterOpen(false)}
          onApply={applyFilter}
        />

        {/* Bottom Navigation (native only, handled internally by BottomNav) */}
        <BottomNav
          activeRoute="home"
          isLoggedIn={Boolean(profile)}
          onNavigate={(route) => {
            if (route === "browse") router.push("/browse" as Href);
            else if (route === "tickets") router.push("/my-tickets" as Href);
            else if (route === "profile") router.push("/profile" as Href);
            // home = current screen, no-op
          }}
        />
      </View>
    </ToastProvider>
  );
}
