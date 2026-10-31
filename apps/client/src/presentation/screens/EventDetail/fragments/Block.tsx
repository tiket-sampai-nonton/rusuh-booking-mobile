/** Prototype `.block` — dark glass panel with an uppercase label + heading. */
import { Text, View } from "react-native";

import type { BlockProps } from "../interface";
import { detailStyles } from "../style";

export function Block({ label, heading, gap, children }: BlockProps) {
  return (
    <View style={detailStyles.block}>
      <View style={detailStyles.blockHeadRow}>
        <Text
          style={detailStyles.blockLabel}
          className="font-semibold uppercase text-white/60"
          accessibilityRole="header"
        >
          {label}
        </Text>
        {gap ? (
          <View style={detailStyles.gapBadge}>
            <Text style={detailStyles.gapBadgeText}>GAP: FE-NEED</Text>
          </View>
        ) : null}
      </View>
      {heading ? (
        <Text style={detailStyles.blockHeading} className="font-extrabold text-white">
          {heading}
        </Text>
      ) : null}
      <View style={detailStyles.blockBody}>{children}</View>
    </View>
  );
}
