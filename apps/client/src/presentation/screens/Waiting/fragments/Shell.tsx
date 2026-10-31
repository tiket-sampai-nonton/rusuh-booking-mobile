/**
 * Dark aura shell: fixed top-left brand link, a glass event-pill, and the
 * framed `card` → `core` (prototype's double-layer frame) with a footnote.
 */
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuraBackground } from "@presentation/components/AuraBackground";
import { ScreenFade } from "@presentation/components/ScreenFade";

import type { ShellProps } from "../interface";
import { waitingBrandTop, waitingStyles } from "../style";

export function Shell({ children, testID, pillLabel }: ShellProps) {
  const insets = useSafeAreaInsets();
  return (
    <ScreenFade>
      <AuraBackground tone="brand" testID={testID}>
        {/* Fixed top-left brand (prototype .mini-nav as a plain brand link). */}
        <View
          className="absolute left-5 z-10 flex-row items-center gap-2.25"
          style={waitingBrandTop(insets.top)}
        >
          <View style={waitingStyles.brandMark} className="items-center justify-center bg-brand">
            <Text style={waitingStyles.brandArrow} accessibilityElementsHidden>▶</Text>
          </View>
          <Text style={waitingStyles.brandText} className="font-extrabold text-white">
            Rusuh Tiket
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-5 py-7">
          {/* event-pill */}
          <View className="mb-5.5 flex-row items-center gap-2.5 rounded-pill border border-white/[0.14] bg-white/[0.07] px-4 py-2">
            <View style={waitingStyles.pillDot} />
            <Text style={waitingStyles.pillLabel} className="font-semibold text-white">{pillLabel}</Text>
          </View>

          {/* card → core double frame */}
          <View
            className="w-full max-w-md rounded-[30px] border border-white/10 bg-white/[0.04]"
            style={waitingStyles.card}
          >
            <View className="items-center rounded-[21px] bg-white/[0.03]" style={waitingStyles.core}>
              {children}
            </View>
          </View>

          {/* footnote */}
          <Text className="mt-5 text-center text-2xs text-white/40" style={waitingStyles.footnote}>
            Antrean First-Come-First-Served. Token antrean diterbitkan &amp;
            divalidasi server. Polling adaptif mengikuti nextPollAfterMs dari server.
          </Text>
        </View>
      </AuraBackground>
    </ScreenFade>
  );
}
