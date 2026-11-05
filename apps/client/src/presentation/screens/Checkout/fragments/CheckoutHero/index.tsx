/**
 * RBT-092 —  Brutalist Mono Checkout Hero
 *
 * PROTOTYPE 03-checkout.html .summary-event EXACT COPY:
 * - 2px border, no rounded corners
 * - Grayscale image filter (web-only, RN needs library)
 * - Black/white typography with uppercase title
 */
import { Image, Text, View } from "react-native";

import { eventImage } from "@domain/rules/event-image";


import type { CheckoutHeroProps } from "../../interface";
import { styles } from "./style";


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
