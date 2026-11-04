/**
 * V2 Brutalist Mono Lineup Grid (Web) / Horizontal Scroll (Native)
 *
 * MATCHES: `.genesis/prototype/v2-mobile/02-event-detail.html` .lineup-scroll (native)
 * MATCHES: `.oil-ui/v2/02-event-detail.html` .lineup-grid (web)
 *
 * Mobile-specific:
 * - Horizontal ScrollView with snap
 * - Smaller item width (100px vs 150px)
 * - Pop animation on entry (staggered)
 * - Active state removes grayscale + scale 1.05
 *
 * Web:
 * - Grid layout with wrap
 * - Hover-based color reveal
 */
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { interFonts } from "@presentation/theme/fonts";
import {
  v2Borders,
  v2Colors,
  v2Duration,
  v2FontSizes,
  v2SpacingSemantic,
} from "@presentation/theme/v2-tokens";

// ═══════════════════════════════════════════════════════════════════════════════
// LINEUP GRID/SCROLL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface LineupItem {
  readonly name: string;
  readonly role: string;
  readonly avatar?: string;
}

interface LineupProps {
  readonly items: readonly LineupItem[];
}

export function Lineup({ items }: LineupProps) {
  const isNative = Platform.OS !== "web";

  if (items.length === 0) {
    return (
      <Text style={lineupStyles.empty}>Daftar pengisi acara akan diumumkan menyusul.</Text>
    );
  }

  // Native: horizontal scroll
  if (isNative) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={lineupStyles.scrollContent}
        style={lineupStyles.scroll}
        snapToInterval={100 + v2SpacingSemantic.s} // Item width + gap
        decelerationRate="fast"
      >
        {items.map((item, index) => (
          <LineupCardNative
            key={item.name}
            name={item.name}
            role={item.role}
            avatar={item.avatar}
            index={index}
          />
        ))}
      </ScrollView>
    );
  }

  // Web: grid layout
  return (
    <View style={lineupStyles.grid}>
      {items.map((item) => (
        <LineupCardWeb
          key={item.name}
          name={item.name}
          role={item.role}
          avatar={item.avatar}
        />
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LINEUP CARD - WEB (Hover-based)
// ═══════════════════════════════════════════════════════════════════════════════

interface LineupCardProps {
  readonly name: string;
  readonly role: string;
  readonly avatar?: string;
}

function LineupCardWeb({ name, role, avatar }: LineupCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Default avatar placeholder
  const avatarUri =
    avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=000&color=fff&bold=true&size=160`;

  return (
    <Pressable
      style={[
        lineupStyles.cardWeb,
        isHovered && lineupStyles.cardHover,
      ]}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <Image
        source={{ uri: avatarUri }}
        style={[
          lineupStyles.avatar,
          // Web-only grayscale filter
          Platform.OS === "web" && ({
            filter: isHovered ? "grayscale(0%)" : "grayscale(100%)",
            transition: "filter 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          } as any),
        ]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <Text
        style={[
          lineupStyles.name,
          isHovered && lineupStyles.nameHover,
        ]}
        numberOfLines={2}
      >
        {name}
      </Text>
      <Text
        style={[
          lineupStyles.role,
          isHovered && lineupStyles.roleHover,
        ]}
        numberOfLines={1}
      >
        {role}
      </Text>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LINEUP CARD - NATIVE (Active-based + Pop animation)
// ═══════════════════════════════════════════════════════════════════════════════

interface LineupCardNativeProps extends LineupCardProps {
  readonly index: number;
}

function LineupCardNative({ name, role, avatar, index }: LineupCardNativeProps) {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Default avatar placeholder
  const avatarUri =
    avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=000&color=fff&bold=true&size=160`;

  // Pop animation on mount (staggered)
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 1100 + index * 100, // Staggered delay
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: v2Duration.normal,
        delay: 1100 + index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim, index]);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Pressable
        style={lineupStyles.cardNative}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
      >
        <View style={lineupStyles.avatarContainer}>
          <Image
            source={{ uri: avatarUri }}
            style={lineupStyles.avatar}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          {/* Native grayscale overlay - fades on press */}
          {!isPressed && (
            <>
              <View style={[StyleSheet.absoluteFill, lineupStyles.grayscaleDark, { borderRadius: 40 }]} />
              <View style={[StyleSheet.absoluteFill, lineupStyles.grayscaleGray, { borderRadius: 40 }]} />
            </>
          )}
        </View>
        <Text
          style={lineupStyles.name}
          numberOfLines={2}
        >
          {name}
        </Text>
        <Text
          style={lineupStyles.role}
          numberOfLines={1}
        >
          {role}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const lineupStyles = StyleSheet.create({
  // Native horizontal scroll
  scroll: {
    marginHorizontal: -v2SpacingSemantic.m, // Bleed to edges
  },
  scrollContent: {
    paddingHorizontal: v2SpacingSemantic.m,
    paddingBottom: v2SpacingSemantic.s,
    gap: v2SpacingSemantic.s,
  },
  // Web grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: v2SpacingSemantic.s, // 16px
  },
  // Web card (150px)
  cardWeb: {
    width: 150,
    alignItems: "center",
    padding: v2SpacingSemantic.m,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.ground,
    // No border-radius (Brutalist)
  },
  cardHover: {
    backgroundColor: v2Colors.ink,
    transform: [{ translateY: -4 }],
  },
  // Native card (100px, smaller for horizontal scroll)
  cardNative: {
    width: 100,
    alignItems: "center",
    padding: v2SpacingSemantic.s,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.ground,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: v2SpacingSemantic.xs,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40, // Exception: avatars are circular
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
  },
  // Native grayscale layers
  grayscaleDark: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  grayscaleGray: {
    backgroundColor: "rgba(128, 128, 128, 0.65)",
  },
  name: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.xs, // 12px on native (smaller)
    color: v2Colors.ink,
    textTransform: "uppercase",
    textAlign: "center",
  },
  nameHover: {
    color: v2Colors.ground,
  },
  role: {
    fontFamily: interFonts.regular,
    fontSize: 10, // Smaller on native
    color: v2Colors.inkMuted,
    textAlign: "center",
    marginTop: 2,
  },
  roleHover: {
    color: v2Colors.ground,
    opacity: 0.7,
  },
  empty: {
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.m,
    color: v2Colors.inkMuted,
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const DEMO_LINEUP: LineupItem[] = [
  { name: "Ahmad Dhani", role: "Keyboards", avatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&q=80" },
  { name: "Once Mekel", role: "Vocal", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
  { name: "Andra Ramadhan", role: "Guitar", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" },
  { name: "Yuke Sampurna", role: "Bass", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80" },
];
