/**
 * RBT-092 —  Brutalist Mono Checkout Hero
 *
 * PROTOTYPE 03-checkout.html .summary-event EXACT COPY:
 * - 2px border, no rounded corners
 * - Grayscale image filter (web-only, RN needs library)
 * - Black/white typography with uppercase title
 */
import { Pressable, Text, View, type ImageStyle } from "react-native";
import { CachedImage } from "@presentation/components/design-system/CachedImage";

import { eventImage } from "@domain/rules/event-image";

import type { CheckoutHeroProps } from "../../interface";
import { styles } from "./style";

export function CheckoutHero({
  eventId,
  eventName,
  eventNameError = false,
  isMobileWeb = false,
  onRetryEventName,
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
        <CachedImage
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
          {eventName ??
            (eventNameError
              ? "Nama event tidak tersedia"
              : "Memuat nama event…")}
        </Text>
        {eventNameError && onRetryEventName ? (
          <Pressable
            accessibilityRole="button"
            onPress={onRetryEventName}
            testID="checkout-event-retry"
          >
            <Text className="mt-2 text-sm font-bold text-foreground underline">
              Coba muat ulang
            </Text>
          </Pressable>
        ) : null}
        <Text style={[styles.subtitle, isMobileWeb && styles.compactSubtitle]}>
          Lengkapi data pembeli &amp; penonton sebelum lanjut bayar.
        </Text>
      </View>
    </View>
  );
}
