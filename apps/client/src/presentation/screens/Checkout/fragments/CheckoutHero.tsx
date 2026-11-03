/**
 * RBT-092 — V2 Brutalist Mono Checkout Hero
 *
 * PROTOTYPE 03-checkout.html .summary-event EXACT COPY:
 * - 2px border, no rounded corners
 * - Grayscale image filter (web-only, RN needs library)
 * - Black/white typography with uppercase title
 */
import { Image, Text, View, StyleSheet } from "react-native";

import { eventImage } from "@domain/rules/event-image";
import { v2Colors, v2Borders, interFonts } from "@presentation/theme";

import type { CheckoutHeroProps } from "../interface";

export function CheckoutHero({ eventId }: CheckoutHeroProps) {
  return (
    <View style={styles.container}>
      {/* Event image with grayscale filter */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: eventImage(eventId) }}
          resizeMode="cover"
          style={styles.image}
        />
      </View>

      {/* Event info */}
      <View style={styles.info}>
        <Text style={styles.title}>Pilih Tiketmu</Text>
        <Text style={styles.subtitle}>
          Lengkapi data pembeli &amp; penonton sebelum lanjut bayar.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.ground,
    overflow: "hidden",
  },
  imageContainer: {
    height: 180,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    // Note: grayscale filter is web-only; RN needs react-native-image-filter-kit
  },
  info: {
    padding: 24,
    borderTopWidth: v2Borders.standard,
    borderTopColor: v2Colors.ink,
  },
  title: {
    color: v2Colors.ink,
    fontSize: 20,
    fontFamily: interFonts.black,
    textTransform: "uppercase",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: v2Colors.gray,
    fontSize: 14,
    fontFamily: interFonts.regular,
    marginTop: 8,
    lineHeight: 22,
  },
});
