/**
 * V2 Brutalist Mono Lineup Grid
 *
 * MATCHES: `.oil-ui/v2/02-event-detail.html` .lineup-grid
 *
 * Features:
 * - Grid of artist cards (150px min width, auto-fill)
 * - Grayscale circular avatars, color on hover
 * - Card flips to ink background on hover
 * - Name uppercase bold, role muted
 */
import { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { interFonts } from "@presentation/theme/fonts";
import {
  v2Borders,
  v2Colors,
  v2FontSizes,
  v2SpacingSemantic,
} from "@presentation/theme/v2-tokens";

// ═══════════════════════════════════════════════════════════════════════════════
// LINEUP GRID COMPONENT
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
  if (items.length === 0) {
    return (
      <Text style={lineupStyles.empty}>Line-up akan diumumkan menyusul.</Text>
    );
  }

  return (
    <View style={lineupStyles.grid}>
      {items.map((item) => (
        <LineupCard
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
// LINEUP CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface LineupCardProps {
  readonly name: string;
  readonly role: string;
  readonly avatar?: string;
}

function LineupCard({ name, role, avatar }: LineupCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Default avatar placeholder
  const avatarUri =
    avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=000&color=fff&bold=true&size=160`;

  return (
    <Pressable
      style={[
        lineupStyles.card,
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
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const lineupStyles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: v2SpacingSemantic.s, // 16px
  },
  card: {
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40, // Exception: avatars are circular
    marginBottom: v2SpacingSemantic.s,
  },
  name: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.s, // 14px
    color: v2Colors.ink,
    textTransform: "uppercase",
    textAlign: "center",
  },
  nameHover: {
    color: v2Colors.ground,
  },
  role: {
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.xs, // 12px
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
