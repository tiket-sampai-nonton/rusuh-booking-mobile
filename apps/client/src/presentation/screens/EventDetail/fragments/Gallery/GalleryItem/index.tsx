import { useState } from "react";
import { Platform, Pressable, Text, View, type ImageStyle } from "react-native";
import { CachedImage } from "@presentation/components/design-system/CachedImage";

import { galleryStyles } from "../style";
import {
  galleryImageHoverStyle,
  galleryItemWidthStyle,
  galleryOverlayOpacityStyle,
} from "./style";

interface GalleryItemProps {
  readonly uri: string;
  readonly fallbackUri?: string;
  readonly index: number;
  readonly columns: number;
  readonly onPress: () => void;
}

export function GalleryItem({
  uri,
  fallbackUri,
  index,
  columns,
  onPress,
}: GalleryItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const gapSize = 2;
  const widthPercent =
    `${(100 - gapSize * (columns - 1)) / columns}%` as `${number}%`;

  return (
    <Pressable
      style={[galleryStyles.item, galleryItemWidthStyle(widthPercent)]}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Lihat gambar ${index + 1}`}
    >
      <CachedImage
        source={{ uri }}
        fallbackSource={fallbackUri ? { uri: fallbackUri } : undefined}
        style={[
          galleryStyles.image,
          Platform.OS === "web" &&
            (galleryImageHoverStyle(isHovered) as unknown as ImageStyle),
        ]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <View
        style={[
          galleryStyles.plusOverlay,
          galleryOverlayOpacityStyle(isHovered),
        ]}
      >
        <Text style={galleryStyles.plusText}>+</Text>
      </View>
    </Pressable>
  );
}
