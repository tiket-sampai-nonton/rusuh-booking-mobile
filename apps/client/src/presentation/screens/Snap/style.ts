/**
 * SnapSimulator screen styles — extracted from inline `style={{…}}` so the JSX
 * carries none (refactor rule).  Brutalist Mono: square black logo mark.
 */
import { StyleSheet, Platform } from "react-native";

import { designColors, designBorder } from "@presentation/theme";

import type { EdgeInsets } from "react-native-safe-area-context";
import type { DynamicStyle } from "@presentation/utils/style";

export const snapStyles = StyleSheet.create({
  scrollContent: { flexGrow: 1, justifyContent: "flex-start", padding: 0 },
  logoMark: {
    width: 40,
    height: 40,
    backgroundColor: designColors.ink,
  },
  logoArrow: { fontSize: 18, fontWeight: "900", color: designColors.ground },
  eyebrow: { letterSpacing: 2.5 },
  heading: { letterSpacing: -0.5 },
});

export const componentStyles = StyleSheet.create({
  elementBackgroundColor0: { backgroundColor: Platform.OS === "web" ? designColors.field : designColors.ground },
  elementWidth1: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderWidth: designBorder.base, borderColor: designColors.ink },
  elementColor2: { color: designColors.ink, fontSize: 22 },
  elementColor3: { color: designColors.ink, fontSize: 14, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  elementWidth4: { width: 44 },
  elementMarginBottom5: { marginBottom: 24 },
  elementColor6: { color: designColors.ink, letterSpacing: 1.5 },
  elementBorderWidth7: { borderWidth: designBorder.base, borderColor: designColors.ink },
  elementColor8: { color: designColors.ink, fontSize: 12, fontWeight: "700" },
  elementBorderWidth9: { borderWidth: designBorder.base, borderColor: designColors.ink, backgroundColor: designColors.field },
  elementColor10: { color: designColors.ink },
  elementColor11: { color: designColors.ink },
  elementColor12: { color: designColors.gray },
  elementBorderWidth13: { borderWidth: designBorder.base, borderColor: designColors.ink, padding: 16 },
  elementColor14: { color: designColors.ink, fontSize: 13, fontWeight: "700" },
  elementColor15: { color: designColors.gray },
});

export function styleForSnapSimulatorScreenView0(arg0: EdgeInsets): DynamicStyle {
  return {
            height: arg0.top + 56,
            paddingTop: arg0.top,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: designColors.ground,
            borderBottomWidth: designBorder.base,
            borderBottomColor: designColors.ink,
          } as DynamicStyle;
}

export function styleForSnapSimulatorScreenView1(): DynamicStyle {
  return { backgroundColor: designColors.ground, paddingHorizontal: 4 } as DynamicStyle;
}

export function styleForSnapSimulatorScreenView2(): DynamicStyle {
  return {
                borderWidth: designBorder.base,
                borderColor: designColors.ink,
                padding: 16,
              } as DynamicStyle;
}

export function styleForSnapSimulatorScreenPressable3(arg0: "bank" | "wallet", arg1: "bank" | "wallet"): DynamicStyle {
  return { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", backgroundColor: arg0 === arg1 ? designColors.ink : designColors.ground } as DynamicStyle;
}

export function styleForSnapSimulatorScreenText4(arg0: "bank" | "wallet", arg1: "bank" | "wallet"): DynamicStyle {
  return { color: arg0 === arg1 ? designColors.ground : designColors.ink, fontSize: 12, fontWeight: "700", textTransform: "uppercase" } as DynamicStyle;
}

export function styleForSnapSimulatorScreenPressable5(arg0: string, arg1: string): DynamicStyle {
  return { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderWidth: designBorder.base, borderColor: designColors.ink, backgroundColor: arg0 === arg1 ? designColors.field : designColors.ground } as DynamicStyle;
}

export function styleForSnapSimulatorScreenPressable6(arg0: string | null, arg1: string): DynamicStyle {
  return { minHeight: 44, justifyContent: "center", paddingHorizontal: 14, borderWidth: designBorder.base, borderColor: designColors.ink, backgroundColor: arg0 === arg1 ? designColors.field : designColors.ground } as DynamicStyle;
}
