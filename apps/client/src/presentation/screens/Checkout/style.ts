/**
 * RBT-092 —  Brutalist Mono Checkout Screen Styles
 *
 * PROTOTYPE 03-checkout.html EXACT COPY:
 * - Shared ground and ink color tokens
 * - 2px solid borders everywhere
 * - Plus Jakarta Sans font family
 * - Progress steps bar at top
 * - No rounded corners
 */
import { type DimensionValue, type ViewStyle, StyleSheet } from "react-native";

import {
  designColors,
  designBorders,
  designSpacingSemantic,
  withAlpha,
} from "@presentation/theme";

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR (prototype .progress-container)
// ═══════════════════════════════════════════════════════════════════════════════

import type { TicketRow } from "@domain/rules/checkout";
import type { DynamicStyle } from "@presentation/utils/style";

export const checkoutProgressContainer: ViewStyle = {
  backgroundColor: designColors.ground,
  borderBottomWidth: designBorders.standard,
  borderBottomColor: designColors.ink,
  paddingVertical: 16,
};

export const checkoutProgressInner: ViewStyle = {
  maxWidth: 800,
  marginHorizontal: "auto",
  paddingHorizontal: designSpacingSemantic.m,
};

export const checkoutProgressSteps: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  position: "relative",
};

export const checkoutProgressLine: ViewStyle = {
  position: "absolute",
  top: "50%",
  left: "10%",
  right: "10%",
  height: 2,
  backgroundColor: designColors.field,
};

export const checkoutStep: ViewStyle = {
  alignItems: "center",
  gap: 8,
};

export const checkoutStepNumber: ViewStyle = {
  width: 40,
  height: 40,
  borderWidth: designBorders.standard,
  borderColor: designColors.ink,
  backgroundColor: designColors.ground,
  alignItems: "center",
  justifyContent: "center",
};

export const checkoutStepNumberActive: ViewStyle = {
  ...checkoutStepNumber,
  backgroundColor: designColors.ink,
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════

/** Scroll content: max-width container on desktop (prototype max-width: 1200px) */
export const checkoutScrollContent = (
  isDesktop: boolean,
  isMobileWeb = false,
): ViewStyle => ({
  padding: isMobileWeb ? 16 : designSpacingSemantic.m,
  paddingBottom: isMobileWeb ? 92 : 140,
  ...(isDesktop
    ? {
        maxWidth: 800,
        width: "100%" as DimensionValue,
        alignSelf: "center" as const,
      }
    : {}),
});

export const checkoutGrid = (isDesktop: boolean): ViewStyle => ({
  ...(isDesktop
    ? {
        flexDirection: "row",
        gap: 48,
      }
    : {}),
});

export const checkoutMain: ViewStyle = {
  flex: 1,
};

export const checkoutSidebar = (isDesktop: boolean): ViewStyle => ({
  width: isDesktop ? 400 : ("100%" as DimensionValue),
  ...(isDesktop
    ? {
        // React Native Web supports CSS `sticky`, which is outside RN's
        // platform-neutral ViewStyle position union.
        position: "sticky" as unknown as ViewStyle["position"],
        top: 128,
      }
    : {
        marginTop: 32,
      }),
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION (prototype .checkout-section)
// ═══════════════════════════════════════════════════════════════════════════════

export const checkoutSection: ViewStyle = {
  marginBottom: 32,
};

export const checkoutSectionHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 16,
  marginBottom: 24,
  paddingBottom: 16,
  borderBottomWidth: designBorders.standard,
  borderBottomColor: designColors.ink,
};

export const checkoutSectionNumber: ViewStyle = {
  width: 32,
  height: 32,
  backgroundColor: designColors.ink,
  alignItems: "center",
  justifyContent: "center",
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM (prototype .form-group)
// ═══════════════════════════════════════════════════════════════════════════════

export const checkoutFormRow: ViewStyle = {
  flexDirection: "row",
  gap: 16,
  marginBottom: 16,
};

export const checkoutFormGroup: ViewStyle = {
  flex: 1,
};

export const checkoutInput: ViewStyle = {
  borderWidth: designBorders.standard,
  borderColor: designColors.ink,
  backgroundColor: designColors.ground,
  paddingVertical: 16,
  paddingHorizontal: 16,
};

export const checkoutInputFocus: ViewStyle = {
  ...checkoutInput,
  // Shadow effect on focus (web only)
};

export const checkoutInputError: ViewStyle = {
  ...checkoutInput,
  borderColor: designColors.danger,
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT METHODS (prototype .payment-methods)
// ═══════════════════════════════════════════════════════════════════════════════

export const checkoutPaymentMethod: ViewStyle = {
  borderWidth: designBorders.standard,
  borderColor: designColors.ink,
  padding: 20,
  flexDirection: "row",
  alignItems: "center",
  gap: 16,
  marginBottom: 16,
};

export const checkoutPaymentMethodSelected: ViewStyle = {
  ...checkoutPaymentMethod,
  backgroundColor: designColors.ink,
};

export const checkoutPaymentRadio: ViewStyle = {
  width: 20,
  height: 20,
  borderWidth: 2,
  borderColor: designColors.ink,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
};

export const checkoutPaymentIcon: ViewStyle = {
  width: 48,
  height: 32,
  borderWidth: 1,
  borderColor: designColors.ink,
  alignItems: "center",
  justifyContent: "center",
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORDER SUMMARY (prototype .order-summary)
// ═══════════════════════════════════════════════════════════════════════════════

export const checkoutOrderSummary: ViewStyle = {
  borderWidth: designBorders.standard,
  borderColor: designColors.ink,
  backgroundColor: designColors.ground,
};

export const checkoutSummaryHeader: ViewStyle = {
  backgroundColor: designColors.ink,
  padding: 24,
};

export const checkoutSummaryContent: ViewStyle = {
  padding: 24,
};

export const checkoutSummaryEvent: ViewStyle = {
  flexDirection: "row",
  gap: 16,
  paddingBottom: 24,
  borderBottomWidth: designBorders.standard,
  borderBottomColor: designColors.ink,
  marginBottom: 24,
};

export const checkoutSummaryImage: ViewStyle = {
  width: 80,
  height: 80,
  borderWidth: designBorders.standard,
  borderColor: designColors.ink,
  overflow: "hidden",
};

export const checkoutSummaryRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 8,
};

export const checkoutSummaryTotal: ViewStyle = {
  ...checkoutSummaryRow,
  borderTopWidth: designBorders.standard,
  borderTopColor: designColors.ink,
  marginTop: 16,
  paddingTop: 16,
};

// ═══════════════════════════════════════════════════════════════════════════════
// TIMER BAR (prototype .timer-bar)
// ═══════════════════════════════════════════════════════════════════════════════

export const checkoutTimerBar: ViewStyle = {
  backgroundColor: designColors.danger,
  paddingVertical: 12,
  paddingHorizontal: 24,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAY BUTTON (prototype .pay-btn)
// ═══════════════════════════════════════════════════════════════════════════════

export const checkoutPaySection: ViewStyle = {
  padding: 24,
  borderTopWidth: designBorders.standard,
  borderTopColor: designColors.ink,
};

export const checkoutPayBtn: ViewStyle = {
  width: "100%" as DimensionValue,
  paddingVertical: 20,
  backgroundColor: designColors.ink,
  borderWidth: designBorders.standard,
  borderColor: designColors.ink,
  alignItems: "center",
  justifyContent: "center",
};

// Legacy exports for backwards compatibility
export const checkoutStyles = {
  timerDot: { width: 8, height: 8, borderRadius: 999 },
  hero: {
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    overflow: "hidden" as const,
  },
  heroScrim: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: withAlpha(designColors.overlay, 0.4),
  },
  heroPad: { padding: 22 },
};

export const checkoutTopBar = (top: number) => ({ paddingTop: top + 10 });

export const checkoutBar = (bottom: number) => ({
  backgroundColor: designColors.ink,
  paddingBottom: bottom + 16,
});

export const componentStyles = StyleSheet.create({
  buyerPrefillBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: designColors.success,
    backgroundColor: designColors.ground,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  buyerPrefillBadgeText: { color: designColors.success },
  addTicketText: {
    color: designColors.ink,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  addTicketLabel: {
    color: designColors.ink,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  quotaWarning: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: designColors.warn,
    backgroundColor: designColors.ground,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  quotaWarningText: { color: designColors.ink, flex: 1, fontSize: 13 },
  quotaWarningEmphasis: { color: designColors.warn, fontWeight: "700" },
});

export function addTicketButtonStyle(
  rows: readonly TicketRow[],
  cap: number,
): DynamicStyle {
  return {
    marginTop: 16,
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    paddingVertical: 16,
    opacity: rows.length >= cap ? 0.4 : 1,
  } as DynamicStyle;
}
