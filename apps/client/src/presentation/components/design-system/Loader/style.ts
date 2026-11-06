import { StyleSheet } from "react-native";

import { designColors, designZIndex, interFonts } from "@presentation/theme";

export const loaderStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: designColors.ink,
    alignItems: "center",
    justifyContent: "center",
    zIndex: designZIndex.max,
  },
  wordmark: {
    flexDirection: "row",
    alignItems: "center",
  },
  letter: {
    color: designColors.ground,
    fontSize: 48,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 4,
    fontFamily: interFonts.black,
  },
  progressTrack: {
    marginTop: 24,
    width: 200,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  reducedProgress: {
    width: "100%",
    height: "100%",
    backgroundColor: designColors.ground,
  },
});
