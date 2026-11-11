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
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
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
  navigateBottomTab,
} from "@presentation/components/design-system";
import { createPrimaryNavLinks } from "@presentation/components/design-system/primary-navigation";
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

  // Modals (prototype: CTA → login modal; Filter → filter popup).
  const [loginOpen, setLoginOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, []),
  );

  const goToEvent = useCallback(
    (eventId: string): void => router.push(`/events/${eventId}` as Href),
    [router],
  );
  const goBrowse = useCallback(
    (): void => router.navigate("/browse" as Href),
    [router],
  );
  const openFilter = useCallback(() => setFilterOpen(true), []);
  const onNavigate = useCallback(
    (href: string) => router.navigate(href as Href),
    [router],
  );
  const navLinks = createPrimaryNavLinks({
    onHome: () => scrollRef.current?.scrollTo({ y: 0, animated: true }),
    onBrowse: goBrowse,
    onTickets: () => router.navigate("/my-tickets" as Href),
    onProfile: () => router.navigate("/profile" as Href),
    isLoggedIn: Boolean(profile),
  });

  // Filter "Terapkan" → /browse with the chosen params.
  const applyFilter = useCallback(
    (f: FilterValue): void => {
      setFilterOpen(false);
      const qs = new URLSearchParams({
        category: f.category,
        time: f.time,
        sort: f.sort,
      }).toString();
      router.navigate(`/browse?${qs}` as Href);
    },
    [router],
  );

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
          testID="home-scroll"
        >
          {isError && <HomeError message={error?.message} />}

          {/* Hero Carousel - Full viewport (prototype .hero) */}
          {data && data.upcoming.length > 0 && (
            <HeroCarousel
              events={data.upcoming.slice(0, 3)}
              onBook={goToEvent}
              onSeeAll={goBrowse}
              // Native prototype has one static featured hero. Avoid rotating
              // three full-bleed images (and their decode work) every 6s.
              autoPlay={!isNative && isScreenFocused}
              isActive={isScreenFocused}
            />
          )}

          {/* Main sections: Events grid, Categories, Stats, How-to, Testimonials, Newsletter, Footer */}
          {data && (
            <HomeSections
              data={data}
              isDesktop={isDesktop}
              columns={gridColumns}
              onPressEvent={goToEvent}
              onFilter={openFilter}
              onSeeAll={goBrowse}
              onFeaturedLayout={() => undefined}
              onHistoryLayout={() => undefined}
              onNavigate={onNavigate}
            />
          )}
        </Animated.ScrollView>

        {/* Fixed Header - slides in from top (prototype .header) */}
        <Header
          topInset={insets.top}
          showLinks={showNavLinks}
          links={navLinks}
          mobileMenuLinks={navLinks}
          isLoggedIn={Boolean(profile)}
          onCtaPress={() => setLoginOpen(true)}
          onLogoPress={() =>
            scrollRef.current?.scrollTo({ y: 0, animated: true })
          }
          actions={[]}
        />

        {/* Login/OTP + Filter modals */}
        <LoginModal
          visible={loginOpen}
          onClose={() => setLoginOpen(false)}
          onOpenPrivacy={() => router.push("/privacy" as Href)}
        />
        <FilterModal
          visible={filterOpen}
          onClose={() => setFilterOpen(false)}
          onApply={applyFilter}
        />

        {/* Bottom Navigation (native only, handled internally by BottomNav) */}
        <BottomNav
          activeRoute="home"
          isLoggedIn={Boolean(profile)}
          onNavigate={(route) => navigateBottomTab(router, "home", route)}
        />
      </View>
    </ToastProvider>
  );
}
