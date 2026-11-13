import { StyleSheet } from "react-native";
import { designColors } from "@presentation/theme";
import { hardShadowStyle } from "@presentation/utils/style";

export const styles = StyleSheet.create({
  returnButton: {
    minHeight: 48,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designColors.accent,
    borderWidth: 2,
    borderColor: designColors.ink,
    ...hardShadowStyle(4, 4, designColors.ink),
  },
  returnText: {
    color: designColors.ground,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
