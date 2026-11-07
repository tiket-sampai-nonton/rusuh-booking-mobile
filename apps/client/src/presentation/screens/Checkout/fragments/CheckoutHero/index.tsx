/**
 * RBT-092 —  Brutalist Mono Checkout Hero
 *
 * PROTOTYPE 03-checkout.html .summary-event EXACT COPY:
 * - 2px border, no rounded corners
 * - Grayscale image filter (web-only, RN needs library)
 * - Black/white typography with uppercase title
 */
import { Image, Text, View, type ImageStyle } from "react-native";

import { eventImage } from "@domain/rules/event-image";

import type { CheckoutHeroProps } from "../../interface";
import { styles } from "./style";

export function CheckoutHero({
  eventId,
  isMobileWeb = false,
}: CheckoutHeroProps) {
  return (
    <View style={[styles.container, isMobileWeb && styles.compactContainer]}>
      {/* Event image with grayscale filter */}
      <View
        style={[
          styles.imageContainer,
          isMobileWeb && styles.compactImageContainer,
        ]}
      >
        <Image
          source={{ uri: eventImage(eventId) }}
          resizeMode="cover"
          style={[
            styles.image,
            isMobileWeb &&
              ({ filter: "grayscale(100%)" } as unknown as ImageStyle),
          ]}
        />
      </View>

      {/* Event info */}
      <View style={[styles.info, isMobileWeb && styles.compactInfo]}>
        <Text style={[styles.title, isMobileWeb && styles.compactTitle]}>
          Pilih Tiketmu
        </Text>
        <Text style={[styles.subtitle, isMobileWeb && styles.compactSubtitle]}>
          Lengkapi data pembeli &amp; penonton sebelum lanjut bayar.
        </Text>
      </View>
    </View>
  );
}
