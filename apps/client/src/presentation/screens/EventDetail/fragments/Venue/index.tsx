/**
 *  Brutalist Mono Venue Section
 *
 * MATCHES: `.oil-ui/v2/02-event-detail.html` .venue-map
 *
 * Features:
 * - 16:9 aspect ratio map image (grayscale default)
 * - Hover overlay with "Buka di Maps" button
 * - Color reveal on hover
 * - Venue name + address info below
 */
import { useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  Text,
  View,
  type ImageStyle,
} from "react-native";
import { CachedImage } from "@presentation/components/design-system/CachedImage";

import { designColors } from "@presentation/theme/event-design-tokens";
import { PinIcon } from "@presentation/components/ArrowIcon";
import { venueStyles } from "./style";
import { styleForVenueImage0, styleForVenueView1 } from "./style";

// ═══════════════════════════════════════════════════════════════════════════════
// VENUE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface VenueProps {
  readonly name: string;
  readonly address: string;
  readonly mapImage?: string;
  readonly mapsUrl?: string;
}

export function Venue({ name, address, mapImage, mapsUrl }: VenueProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleOpenMap = () => {
    if (mapsUrl) {
      Linking.openURL(mapsUrl);
    } else {
      // Default: open Google Maps search for the venue name
      const query = encodeURIComponent(`${name} ${address}`);
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${query}`,
      );
    }
  };

  // Default map image (Jakarta stadium)
  const imageUri =
    mapImage ||
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80";

  return (
    <View>
      {/* Map Container */}
      <Pressable
        style={venueStyles.mapContainer}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPress={handleOpenMap}
        accessibilityRole="button"
        accessibilityLabel={`Buka lokasi ${name} di maps`}
      >
        <CachedImage
          source={{ uri: imageUri }}
          style={[
            venueStyles.mapImage,
            // Web-only grayscale filter
            Platform.OS === "web" &&
              (styleForVenueImage0(isHovered) as unknown as ImageStyle),
          ]}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />

        {/* Hover Overlay */}
        <View style={[venueStyles.mapOverlay, styleForVenueView1(isHovered)]}>
          <View style={venueStyles.mapBtn}>
            <PinIcon color={designColors.ground} size={16} />
            <Text style={venueStyles.mapBtnText}>Buka Peta</Text>
          </View>
        </View>
      </Pressable>

      {/* Venue Info */}
      <View style={venueStyles.info}>
        <Text style={venueStyles.name}>{name}</Text>
        <Text style={venueStyles.address}>{address}</Text>
      </View>
    </View>
  );
}
