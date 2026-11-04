/**
 * V2 Brutalist Mono Venue Section
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
  Image,
  Linking,
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
import { PinIcon } from "@presentation/components/ArrowIcon";

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
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
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
        <Image
          source={{ uri: imageUri }}
          style={[
            venueStyles.mapImage,
            // Web-only grayscale filter
            Platform.OS === "web" && ({
              filter: isHovered ? "grayscale(0%)" : "grayscale(100%)",
              transition: "filter 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            } as any),
          ]}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />

        {/* Hover Overlay */}
        <View
          style={[
            venueStyles.mapOverlay,
            { opacity: isHovered ? 1 : 0 },
          ]}
        >
          <View style={venueStyles.mapBtn}>
            <PinIcon color={v2Colors.ground} size={16} />
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

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const venueStyles = StyleSheet.create({
  mapContainer: {
    position: "relative",
    aspectRatio: 16 / 9,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    overflow: "hidden",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: v2SpacingSemantic.xs,
    paddingVertical: v2SpacingSemantic.s,
    paddingHorizontal: v2SpacingSemantic.m,
    backgroundColor: v2Colors.ground,
  },
  mapBtnIcon: {
    fontSize: 16,
  },
  mapBtnText: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.s,
    color: v2Colors.ink,
    textTransform: "uppercase",
    letterSpacing: v2FontSizes.s * 0.04,
  },
  info: {
    marginTop: v2SpacingSemantic.m,
  },
  name: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.l,
    color: v2Colors.ink,
    marginBottom: v2SpacingSemantic.xs,
  },
  address: {
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.s,
    color: v2Colors.inkMuted,
    lineHeight: v2FontSizes.s * 1.5,
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const DEMO_VENUE = {
  name: "Jakarta International Stadium (JIS)",
  address: "Jl. Benyamin Sueb, Papanggo, Tanjung Priok, Jakarta Utara 14340",
  mapImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
  mapsUrl: "https://goo.gl/maps/JIS",
};
