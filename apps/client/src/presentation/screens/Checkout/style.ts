/**
 * RBT-092 — V2 Brutalist Mono Checkout Screen Styles
 *
 * PROTOTYPE 03-checkout.html EXACT COPY:
 * - White background (var(--white)), black ink (var(--black))
 * - 2px solid borders everywhere
 * - Inter font family
 * - Progress steps bar at top
 * - No rounded corners
 */
import { type DimensionValue, type ViewStyle } from 'react-native';

import { v2Colors, v2Borders, v2SpacingSemantic } from '@presentation/theme';

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR (prototype .progress-container)
// ═══════════════════════════════════════════════════════════════════════════════

export const checkoutProgressContainer: ViewStyle = {
  backgroundColor: v2Colors.ground,
  borderBottomWidth: v2Borders.standard,
  borderBottomColor: v2Colors.ink,
  paddingVertical: 16,
};

export const checkoutProgressInner: ViewStyle = {
  maxWidth: 800,
  marginHorizontal: 'auto',
  paddingHorizontal: v2SpacingSemantic.m,
};

export const checkoutProgressSteps: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  position: 'relative',
};

export const checkoutProgressLine: ViewStyle = {
  position: 'absolute',
  top: '50%',
  left: '10%',
  right: '10%',
  height: 2,
  backgroundColor: v2Colors.field, // #f5f5f5 - Use field per Design Palette Guide (no arbitrary grays)
};

export const checkoutStep: ViewStyle = {
  alignItems: 'center',
  gap: 8,
};

export const checkoutStepNumber: ViewStyle = {
  width: 40,
  height: 40,
  borderWidth: v2Borders.standard,
  borderColor: v2Colors.ink,
  backgroundColor: v2Colors.ground,
  alignItems: 'center',
  justifyContent: 'center',
};

export const checkoutStepNumberActive: ViewStyle = {
  ...checkoutStepNumber,
  backgroundColor: v2Colors.ink,
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════

/** Scroll content: max-width container on desktop (prototype max-width: 1200px) */
export const checkoutScrollContent = (isDesktop: boolean): ViewStyle => ({
  padding: v2SpacingSemantic.m,
  paddingBottom: 140, // Room for sticky bar
  ...(isDesktop
    ? {
        maxWidth: 800,
        width: '100%' as DimensionValue,
        alignSelf: 'center' as const,
      }
    : {}),
});

export const checkoutGrid = (isDesktop: boolean): ViewStyle => ({
  ...(isDesktop
    ? {
        flexDirection: 'row',
        gap: 48,
      }
    : {}),
});

export const checkoutMain: ViewStyle = {
  flex: 1,
};

export const checkoutSidebar = (isDesktop: boolean): ViewStyle => ({
  width: isDesktop ? 400 : '100%' as DimensionValue,
  ...(isDesktop
    ? {
        position: 'sticky' as any,
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
  flexDirection: 'row',
  alignItems: 'center',
  gap: 16,
  marginBottom: 24,
  paddingBottom: 16,
  borderBottomWidth: v2Borders.standard,
  borderBottomColor: v2Colors.ink,
};

export const checkoutSectionNumber: ViewStyle = {
  width: 32,
  height: 32,
  backgroundColor: v2Colors.ink,
  alignItems: 'center',
  justifyContent: 'center',
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM (prototype .form-group)
// ═══════════════════════════════════════════════════════════════════════════════

export const checkoutFormRow: ViewStyle = {
  flexDirection: 'row',
  gap: 16,
  marginBottom: 16,
};

export const checkoutFormGroup: ViewStyle = {
  flex: 1,
};

export const checkoutInput: ViewStyle = {
  borderWidth: v2Borders.standard,
  borderColor: v2Colors.ink,
  backgroundColor: v2Colors.ground,
  paddingVertical: 16,
  paddingHorizontal: 16,
};

export const checkoutInputFocus: ViewStyle = {
  ...checkoutInput,
  // Shadow effect on focus (web only)
};

export const checkoutInputError: ViewStyle = {
  ...checkoutInput,
  borderColor: v2Colors.danger, // #ff0000 per Design Palette Guide
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT METHODS (prototype .payment-methods)
// ═══════════════════════════════════════════════════════════════════════════════

export const checkoutPaymentMethod: ViewStyle = {
  borderWidth: v2Borders.standard,
  borderColor: v2Colors.ink,
  padding: 20,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 16,
  marginBottom: 16,
};

export const checkoutPaymentMethodSelected: ViewStyle = {
  ...checkoutPaymentMethod,
  backgroundColor: v2Colors.ink,
};

export const checkoutPaymentRadio: ViewStyle = {
  width: 20,
  height: 20,
  borderWidth: 2,
  borderColor: v2Colors.ink,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
};

export const checkoutPaymentIcon: ViewStyle = {
  width: 48,
  height: 32,
  borderWidth: 1,
  borderColor: v2Colors.ink,
  alignItems: 'center',
  justifyContent: 'center',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORDER SUMMARY (prototype .order-summary)
// ═══════════════════════════════════════════════════════════════════════════════

export const checkoutOrderSummary: ViewStyle = {
  borderWidth: v2Borders.standard,
  borderColor: v2Colors.ink,
  backgroundColor: v2Colors.ground,
};

export const checkoutSummaryHeader: ViewStyle = {
  backgroundColor: v2Colors.ink,
  padding: 24,
};

export const checkoutSummaryContent: ViewStyle = {
  padding: 24,
};

export const checkoutSummaryEvent: ViewStyle = {
  flexDirection: 'row',
  gap: 16,
  paddingBottom: 24,
  borderBottomWidth: v2Borders.standard,
  borderBottomColor: v2Colors.ink,
  marginBottom: 24,
};

export const checkoutSummaryImage: ViewStyle = {
  width: 80,
  height: 80,
  borderWidth: v2Borders.standard,
  borderColor: v2Colors.ink,
  overflow: 'hidden',
};

export const checkoutSummaryRow: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8,
};

export const checkoutSummaryTotal: ViewStyle = {
  ...checkoutSummaryRow,
  borderTopWidth: v2Borders.standard,
  borderTopColor: v2Colors.ink,
  marginTop: 16,
  paddingTop: 16,
};

// ═══════════════════════════════════════════════════════════════════════════════
// TIMER BAR (prototype .timer-bar)
// ═══════════════════════════════════════════════════════════════════════════════

export const checkoutTimerBar: ViewStyle = {
  backgroundColor: v2Colors.danger, // #ff0000 per Design Palette Guide
  paddingVertical: 12,
  paddingHorizontal: 24,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAY BUTTON (prototype .pay-btn)
// ═══════════════════════════════════════════════════════════════════════════════

export const checkoutPaySection: ViewStyle = {
  padding: 24,
  borderTopWidth: v2Borders.standard,
  borderTopColor: v2Colors.ink,
};

export const checkoutPayBtn: ViewStyle = {
  width: '100%' as DimensionValue,
  paddingVertical: 20,
  backgroundColor: v2Colors.ink,
  borderWidth: v2Borders.standard,
  borderColor: v2Colors.ink,
  alignItems: 'center',
  justifyContent: 'center',
};

// Legacy exports for backwards compatibility
export const checkoutStyles = {
  timerDot: { width: 8, height: 8, borderRadius: 999 },
  hero: {
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    overflow: 'hidden' as const,
  },
  heroScrim: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroPad: { padding: 22 },
};

export const checkoutTopBar = (top: number) => ({ paddingTop: top + 10 });

export const checkoutBar = (bottom: number) => ({
  backgroundColor: v2Colors.ink,
  paddingBottom: bottom + 16,
});
