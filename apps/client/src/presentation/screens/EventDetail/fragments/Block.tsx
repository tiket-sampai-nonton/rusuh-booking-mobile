/**
 * V2 Brutalist Mono section block (RBT-090).
 *
 * Prototype 02-event-detail `.section`: an uppercase label underlined by a short
 * hard rule, then a bold heading. Over the screen's dark hero backdrop the block
 * text stays light; the label rule + accent use the V2 live-red. The dev-only
 * "GAP: FE-NEED" badge is dropped (not in the prototype). Same props as before.
 */
import { Text, View } from "react-native";

import { v2 } from "@presentation/theme";

import type { BlockProps } from "../interface";
import { detailStyles } from "../style";

export function Block({ label, heading, children }: BlockProps) {
  return (
    <View style={detailStyles.block}>
      <View style={{ marginBottom: 12 }}>
        <Text
          style={{ color: v2.ground, letterSpacing: 2, opacity: 0.85 }}
          className="text-2xs font-v2 font-bold uppercase"
          accessibilityRole="header"
        >
          {label}
        </Text>
        <View style={{ width: 28, height: 2, backgroundColor: v2.accent, marginTop: 8 }} />
      </View>
      {heading ? (
        <Text
          style={{ color: v2.ground, letterSpacing: -0.5 }}
          className="text-2xl font-v2 font-black"
        >
          {heading}
        </Text>
      ) : null}
      <View style={detailStyles.blockBody}>{children}</View>
    </View>
  );
}
