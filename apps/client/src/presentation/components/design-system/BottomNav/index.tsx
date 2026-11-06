/**
 * RBT-097 — BottomNav (Mobile Native)
 *
 * Mobile-only bottom navigation from v2-mobile/01-home.html:
 * - Fixed bottom, height: 72px + safe-area-inset-bottom
 * - 4 items: Home, Browse, Tickets, Profile
 * - Active indicator: 3px bar slides from top
 * - Icon: 24x24px, label: 10px uppercase
 * - Press feedback: scale(0.9) on icon, field background
 * - Slide-up animation on mount
 *
 * This component renders ONLY on native (iOS/Android).
 * On web, navigation is handled by Header.
 */
import { useEffect } from "react";
import { Platform } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { designEasing } from "@presentation/theme";
import { HomeIcon } from "./NavItem/icons/HomeIcon";
import { BrowseIcon } from "./NavItem/icons/BrowseIcon";
import { TicketsIcon } from "./NavItem/icons/TicketsIcon";
import { ProfileIcon } from "./NavItem/icons/ProfileIcon";
import { NavItem } from "./NavItem";
import type { BottomNavIconProps, BottomNavRoute } from "./types";
import { bottomNavBarStyle } from "./style";

const EASE = Easing.bezier(...designEasing.primary);
export type { BottomNavRoute } from "./types";

export interface BottomNavProps {
  /** Currently active route */
  readonly activeRoute: BottomNavRoute;
  /** Navigation handler */
  readonly onNavigate: (route: BottomNavRoute) => void;
  readonly isLoggedIn?: boolean;
  /** Test ID prefix */
  readonly testIDPrefix?: string;
}

const NAV_ITEMS: readonly {
  route: BottomNavRoute;
  label: string;
  Icon: React.ComponentType<BottomNavIconProps>;
}[] = [
  { route: "home", label: "Beranda", Icon: HomeIcon },
  { route: "browse", label: "Jelajahi", Icon: BrowseIcon },
  { route: "tickets", label: "Tiket", Icon: TicketsIcon },
  { route: "profile", label: "Akun", Icon: ProfileIcon },
];

/**
 * BottomNav — Native-only bottom navigation bar
 *
 * On web, this component returns null and Header handles navigation.
 */
export function BottomNav({
  activeRoute,
  onNavigate,
  isLoggedIn = false,
  testIDPrefix = "bottom-nav",
}: BottomNavProps) {
  // Call all hooks BEFORE any conditional returns (React rules of hooks)
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const slideIn = useSharedValue(reducedMotion ? 0 : 1); // Start hidden (translateY 100%)

  // Slide-up animation on mount (prototype: 0.5s ease, 1.3s delay)
  useEffect(() => {
    // Only run animation on native
    if (Platform.OS === "web") return;

    if (reducedMotion) {
      slideIn.value = 0;
      return;
    }
    slideIn.value = withDelay(
      1300,
      withTiming(0, { duration: 500, easing: EASE }),
    );
  }, [reducedMotion, slideIn]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: `${slideIn.value * 100}%` as `${number}%` }],
  }));

  // Web: no bottom nav (handled by Header)
  // Return AFTER all hooks are called
  if (Platform.OS === "web") {
    return null;
  }

  const navBarStyle = bottomNavBarStyle(insets.bottom);

  return (
    <Animated.View style={[navBarStyle, containerStyle]} testID={testIDPrefix}>
      {NAV_ITEMS.filter((item) => item.route !== "tickets" || isLoggedIn).map(
        (item) => (
          <NavItem
            key={item.route}
            label={item.label}
            Icon={item.Icon}
            active={activeRoute === item.route}
            onPress={() => onNavigate(item.route)}
            testID={`${testIDPrefix}-${item.route}`}
          />
        ),
      )}
    </Animated.View>
  );
}

export default BottomNav;
