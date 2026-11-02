/** hero-ev banner (16:7) — image from the session's event (O2: no name yet). */
import { ImageBackground, Text, View } from "react-native";

import { eventImage } from "@domain/rules/event-image";

import type { CheckoutHeroProps } from "../interface";
import { checkoutStyles } from "../style";

export function CheckoutHero({ eventId }: CheckoutHeroProps) {
  return (
    <ImageBackground source={{ uri: eventImage(eventId) }} resizeMode="cover" style={checkoutStyles.hero}>
      <View style={checkoutStyles.heroScrim} />
      <View style={checkoutStyles.heroPad}>
        <Text className="text-xl font-extrabold text-white">Pilih tiketmu</Text>
        <Text className="mt-1.5 text-xs text-white/85">
          Lengkapi data pembeli &amp; penonton sebelum lanjut bayar.
        </Text>
      </View>
    </ImageBackground>
  );
}
