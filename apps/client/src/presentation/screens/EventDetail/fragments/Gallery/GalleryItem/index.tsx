import { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  Text,
  View,
  type ImageStyle,
} from "react-native";

import { galleryStyles } from "../style";
import {
  galleryImageHoverStyle,
  galleryItemWidthStyle,
  galleryOverlayOpacityStyle,
} from "./style";

interface GalleryItemProps {
  readonly uri: string;
  readonly index: number;
  readonly columns: number;
  readonly onPress: () => void;
}

export function GalleryItem({
  uri,
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
      <Image
        source={{ uri }}
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
