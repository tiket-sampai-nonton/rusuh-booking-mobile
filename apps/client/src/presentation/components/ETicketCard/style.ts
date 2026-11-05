/**  e-ticket styles — the dashed perforation divider (prototype `.ticket-divider`). */
import { StyleSheet } from "react-native";

import { designColors, designBorder } from "@presentation/theme";

export const eTicketStyles = StyleSheet.create({
  divider: { borderTopWidth: 2, borderStyle: "dashed", borderTopColor: designColors.field },
});

export const componentStyles = StyleSheet.create({
  elementBorderWidth0: { borderWidth: designBorder.base, borderColor: designColors.ink, backgroundColor: designColors.ground },
  elementBackgroundColor1: { backgroundColor: designColors.ink },
  elementLetterSpacing2: { letterSpacing: -0.3 },
  elementBackgroundColor3: { backgroundColor: designColors.ink },
  elementColor4: { color: designColors.ink, letterSpacing: 1.5 },
  elementBorderTopWidth5: { borderTopWidth: designBorder.base, borderTopColor: designColors.ink, paddingTop: 16 },
  elementColor6: { color: designColors.ink },
  elementColor7: { color: designColors.gray },
  elementColor8: { color: designColors.gray },
  elementColor9: { color: designColors.ink },
  elementColor10: { color: designColors.gray },
});
