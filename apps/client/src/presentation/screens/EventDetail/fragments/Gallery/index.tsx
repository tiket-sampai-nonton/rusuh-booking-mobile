/**
 *  Brutalist Mono Gallery Grid
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
import { useResponsive } from "@presentation/hooks/useResponsive";
import { Text, View } from "react-native";

import { GalleryItem } from "./GalleryItem";
import { galleryStyles } from "./style";

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface GalleryProps {
  readonly images: readonly string[];
  readonly fallbackUri?: string;
  readonly onImagePress?: (index: number) => void;
}

export function Gallery({ images, fallbackUri, onImagePress }: GalleryProps) {
  const { isDesktop } = useResponsive();
  const columns = isDesktop ? 4 : 2;

  if (images.length === 0) {
    return <Text style={galleryStyles.empty}>Galeri belum tersedia.</Text>;
  }

  return (
    <View style={galleryStyles.grid}>
      {images.map((uri, index) => (
        <GalleryItem
          key={uri}
          uri={uri}
          fallbackUri={fallbackUri}
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
