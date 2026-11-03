/**
 * V2 Brutalist Mono Gallery Grid
 *
 * MATCHES: `.oil-ui/v2/02-event-detail.html` .gallery-grid
 *
 * Features:
 * - 4-column grid (2 on mobile)
 * - Square aspect ratio images
 * - Grayscale default, color + scale on hover
 * - "+" overlay on hover
 * - Opens Lightbox on press
 */
import { useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import {
  v2Colors,
} from "@presentation/theme/v2-tokens";
import { interFonts } from "@presentation/theme/fonts";
import { useResponsive } from "@presentation/hooks/useResponsive";

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface GalleryProps {
  readonly images: readonly string[];
  readonly onImagePress?: (index: number) => void;
}

export function Gallery({ images, onImagePress }: GalleryProps) {
  const { isDesktop } = useResponsive();
  const columns = isDesktop ? 4 : 2;

  if (images.length === 0) {
    return (
      <Text style={galleryStyles.empty}>Galeri belum tersedia.</Text>
    );
  }

  return (
    <View style={galleryStyles.grid}>
      {images.map((uri, index) => (
        <GalleryItem
          key={uri}
          uri={uri}
          index={index}
          columns={columns}
          onPress={() => onImagePress?.(index)}
        />
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY ITEM
// ═══════════════════════════════════════════════════════════════════════════════

interface GalleryItemProps {
  readonly uri: string;
  readonly index: number;
  readonly columns: number;
  readonly onPress: () => void;
}

function GalleryItem({ uri, index, columns, onPress }: GalleryItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate width for columns (account for 2px gaps)
  const gapSize = 2;
  const widthPercent = `${(100 - gapSize * (columns - 1)) / columns}%`;

  return (
    <Pressable
      style={[galleryStyles.item, { width: widthPercent as any }]}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Lihat gambar ${index + 1}`}
    >
      <Image
        source={{ uri }}
        style={[
          galleryStyles.image,
          // Web-only grayscale + hover effects
          Platform.OS === "web" && ({
            filter: isHovered ? "grayscale(0%)" : "grayscale(100%)",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          } as any),
        ]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />

      {/* Plus overlay on hover */}
      <View
        style={[
          galleryStyles.plusOverlay,
          { opacity: isHovered ? 1 : 0 },
        ]}
      >
        <Text style={galleryStyles.plusText}>+</Text>
      </View>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const galleryStyles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: v2Colors.ink, // Black gaps between images
    gap: 2,
  },
  item: {
    aspectRatio: 1,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  plusOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: {
    fontFamily: interFonts.black,
    fontSize: 32,
    color: v2Colors.ground,
  },
  empty: {
    fontFamily: interFonts.regular,
    fontSize: 14,
    color: v2Colors.inkMuted,
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const DEMO_GALLERY = [
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&q=80",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80",
];
