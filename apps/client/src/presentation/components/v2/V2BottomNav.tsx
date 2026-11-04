/**
 * RBT-097 — V2BottomNav (Mobile Native)
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
 * On web, navigation is handled by V2Header.
 */
import { useEffect } from 'react';
import { Platform, Pressable, Text, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

import { v2Colors, v2Borders, v2Easing, v2Layout } from '@presentation/theme';

const EASE = Easing.bezier(...v2Easing.primary);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type BottomNavRoute = 'home' | 'browse' | 'tickets' | 'profile';

export interface V2BottomNavProps {
  /** Currently active route */
  readonly activeRoute: BottomNavRoute;
  /** Navigation handler */
  readonly onNavigate: (route: BottomNavRoute) => void;
  readonly isLoggedIn?: boolean;
  /** Test ID prefix */
  readonly testIDPrefix?: string;
}

// Icon components (from v2-mobile prototype SVGs, 24x24px)
function HomeIcon({ active }: { readonly active: boolean }) {
  const color = active ? v2Colors.ink : v2Colors.inkMuted;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke={color}
        strokeWidth={2}
      />
      <Polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

function BrowseIcon({ active }: { readonly active: boolean }) {
  const color = active ? v2Colors.ink : v2Colors.inkMuted;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

function TicketsIcon({ active }: { readonly active: boolean }) {
  const color = active ? v2Colors.ink : v2Colors.inkMuted;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 9a3 3 0 0 1 0 6v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a3 3 0 0 1 0-6V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v5z"
        stroke={color}
        strokeWidth={2}
      />
      <Path d="M9 2v2M9 12v2M9 20v2" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ProfileIcon({ active }: { readonly active: boolean }) {
  const color = active ? v2Colors.ink : v2Colors.inkMuted;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

const NAV_ITEMS: readonly {
  route: BottomNavRoute;
  label: string;
  Icon: React.FC<{ active: boolean }>;
}[] = [
  { route: 'home', label: 'Beranda', Icon: HomeIcon },
  { route: 'browse', label: 'Jelajahi', Icon: BrowseIcon },
  { route: 'tickets', label: 'Tiket', Icon: TicketsIcon },
  { route: 'profile', label: 'Akun', Icon: ProfileIcon },
];

/** Individual nav item with press animation and active indicator */
function NavItem({
  label,
  Icon,
  active,
  onPress,
  testID,
}: {
  readonly label: string;
  readonly Icon: React.FC<{ active: boolean }>;
  readonly active: boolean;
  readonly onPress: () => void;
  readonly testID?: string;
}) {
  const reducedMotion = useReducedMotion();
  const pressed = useSharedValue(0);
  const indicatorScale = useSharedValue(active ? 1 : 0);

  // Update indicator when active state changes
  useEffect(() => {
    if (reducedMotion) {
      indicatorScale.value = active ? 1 : 0;
      return;
    }
    indicatorScale.value = withSpring(active ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [active, reducedMotion, indicatorScale]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.1 }], // scale(0.9) on press
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: indicatorScale.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: pressed.value > 0.5 ? v2Colors.field : 'transparent',
  }));

  return (
    <AnimatedPressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      testID={testID}
      onPressIn={() => {
        pressed.value = reducedMotion ? 1 : withTiming(1, { duration: 100 });
      }}
      onPressOut={() => {
        pressed.value = reducedMotion ? 0 : withTiming(0, { duration: 150 });
      }}
      onPress={onPress}
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          position: 'relative',
        },
        bgStyle,
      ]}
    >
      {/* Active indicator bar (top, 32px × 3px) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: '50%',
            marginLeft: -16,
            width: 32,
            height: 3,
            backgroundColor: v2Colors.ink,
          },
          indicatorStyle,
        ]}
      />

      {/* Icon */}
      <Animated.View style={iconAnimStyle}>
        <Icon active={active} />
      </Animated.View>

      {/* Label */}
      <Text
        style={{
          fontSize: 10,
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: 0.5, // 0.05em at 10px
          color: active ? v2Colors.ink : v2Colors.inkMuted,
        }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

/**
 * V2BottomNav — Native-only bottom navigation bar
 *
 * On web, this component returns null and V2Header handles navigation.
 */
export function V2BottomNav({
  activeRoute,
  onNavigate,
  isLoggedIn = false,
  testIDPrefix = 'bottom-nav',
}: V2BottomNavProps) {
  // Call all hooks BEFORE any conditional returns (React rules of hooks)
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const slideIn = useSharedValue(reducedMotion ? 0 : 1); // Start hidden (translateY 100%)

  // Slide-up animation on mount (prototype: 0.5s ease, 1.3s delay)
  useEffect(() => {
    // Only run animation on native
    if (Platform.OS === 'web') return;

    if (reducedMotion) {
      slideIn.value = 0;
      return;
    }
    slideIn.value = withDelay(
      1300,
      withTiming(0, { duration: 500, easing: EASE })
    );
  }, [reducedMotion, slideIn]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: `${slideIn.value * 100}%` as `${number}%` }],
  }));

  // Web: no bottom nav (handled by V2Header)
  // Return AFTER all hooks are called
  if (Platform.OS === 'web') {
    return null;
  }

  const navBarStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: v2Layout.bottomBarHeight + insets.bottom,
    paddingBottom: insets.bottom,
    backgroundColor: v2Colors.ground,
    borderTopWidth: v2Borders.standard,
    borderTopColor: v2Colors.ink,
    flexDirection: 'row',
    zIndex: 100,
  };

  return (
    <Animated.View style={[navBarStyle, containerStyle]} testID={testIDPrefix}>
      {NAV_ITEMS.filter((item) => item.route !== 'tickets' || isLoggedIn).map((item) => (
        <NavItem
          key={item.route}
          label={item.label}
          Icon={item.Icon}
          active={activeRoute === item.route}
          onPress={() => onNavigate(item.route)}
          testID={`${testIDPrefix}-${item.route}`}
        />
      ))}
    </Animated.View>
  );
}

export default V2BottomNav;
