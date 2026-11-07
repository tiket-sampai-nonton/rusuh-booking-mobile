import { StyleSheet } from "react-native";

import { plusJakartaSansFonts } from "@presentation/theme/fonts";
import { withAlpha } from "@presentation/theme";
import { designColors } from "@presentation/theme/event-design-tokens";

export const galleryStyles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: designColors.ink,
    gap: 2,
  },
  item: {
    aspectRatio: 1,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  plusOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: withAlpha(designColors.overlay, 0.5),
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: {
    fontFamily: plusJakartaSansFonts.extraBold,
    fontSize: 32,
    color: designColors.ground,
  },
  empty: {
    fontFamily: plusJakartaSansFonts.regular,
    fontSize: 14,
    color: designColors.inkMuted,
  },
});
