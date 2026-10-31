/** hero-ev: photo banner + scrim + status pill + name + meta + chips. */
import { ImageBackground, Text, View } from "react-native";

import type { DetailHeroProps } from "../interface";
import { detailStyles } from "../style";

export function DetailHero({ banner, statusLabel, name, meta, chips }: DetailHeroProps) {
  return (
    <ImageBackground source={{ uri: banner }} resizeMode="cover" style={detailStyles.hero}>
      <View style={detailStyles.heroScrim} />
      <View style={detailStyles.heroPad}>
        {/* Live-dot status pill. */}
        <View className="flex-row">
          <View style={detailStyles.statusPill}>
            <View style={detailStyles.statusDot} />
            <Text style={detailStyles.statusText} className="font-semibold text-white">
              {statusLabel}
            </Text>
          </View>
        </View>
        <Text
          style={detailStyles.heroName}
          className="font-extrabold text-white"
          accessibilityRole="header"
          numberOfLines={3}
        >
          {name}
        </Text>
        <Text style={detailStyles.heroMeta} className="text-white/80">{meta}</Text>
        {/* chips */}
        <View style={detailStyles.chipRow}>
          {chips.map((c) => (
            <View key={c} style={detailStyles.chip}>
              <Text style={detailStyles.chipText} className="text-white/80">{c}</Text>
            </View>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}
