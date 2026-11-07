/** Login modal layout and behavior styles. Colors come from shared theme tokens. */
import { Platform, StyleSheet, type TextStyle } from "react-native";

import { plusJakartaSansFonts } from "@presentation/theme/fonts";
import { withAlpha } from "@presentation/theme";
import { hardShadowStyle } from "@presentation/utils/style";
import {
  designBorders,
  designColors,
  designFontSizes,
  designModal,
  designSpacingSemantic,
} from "@presentation/theme/event-design-tokens";

/**
 * Modal overlay color is derived from the shared deep-green overlay token.
 */
import type { DynamicStyle } from "@presentation/utils/style";
import { Animated } from "react-native";

export const SCRIM = withAlpha(designColors.overlay, 0.8);

/**
 * Success state uses the shared semantic success token.
 */
export const DONE_GREEN = designColors.success;

/**
 * OTP input box dimensions (prototype: 48x56px).
 */
export const OTP_BOX = {
  // Six boxes plus gaps must fit inside the desktop modal's 300px content area.
  width: 40,
  height: 48,
};

export const loginStyles = StyleSheet.create({
  // ---------------------------------------------------------------------------
  // Overlay + backdrop
  // ---------------------------------------------------------------------------
  overlay: {
    flex: 1,
    backgroundColor: SCRIM,
    alignItems: "center",
    justifyContent: "center",
    padding: designSpacingSemantic.s, // 16px
    // Web: backdrop-filter blur
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(4px)",
      WebkitBackdropFilter: "blur(4px)",
    }),
  },
  mobileWebOverlay: { justifyContent: "flex-end", padding: 0 },

  // ---------------------------------------------------------------------------
  // Modal card — prototype .modal
  // ---------------------------------------------------------------------------
  card: {
    width: "100%",
    maxWidth: designModal.maxWidth, // 400px
    backgroundColor: designColors.ground,
    borderWidth: designBorders.standard, // 2px
    borderColor: designColors.ink,
    borderRadius: 0, // Brutalist: NO border-radius
    padding: designModal.padding, // 48px
    position: "relative",
  },
  mobileWebCard: {
    maxWidth: "100%",
    maxHeight: "100%",
    flexShrink: 1,
    padding: 16,
    paddingTop: 56,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },

  // ---------------------------------------------------------------------------
  // Close button — prototype .modal-close
  // ---------------------------------------------------------------------------
  closeBtn: {
    position: "absolute",
    top: designSpacingSemantic.s, // 16px
    right: designSpacingSemantic.s,
    width: 40,
    height: 40,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  mobileWebCloseBtn: { top: 8, right: 16 },
  closeBtnText: {
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 20,
    color: designColors.ink,
    lineHeight: 20,
  },

  // ---------------------------------------------------------------------------
  // Typography
  // ---------------------------------------------------------------------------
  title: {
    fontFamily: plusJakartaSansFonts.extraBold, // weight 800
    fontSize: designFontSizes.l, // 18px (--text-l)
    color: designColors.ink,
    textTransform: "uppercase",
    letterSpacing: designFontSizes.l * -0.02, // -0.02em
    marginBottom: designSpacingSemantic.xs, // 8px
  },
  sub: {
    fontFamily: plusJakartaSansFonts.regular,
    fontSize: designFontSizes.s, // 14px (--text-s)
    color: designColors.inkMuted,
    lineHeight: designFontSizes.s * 1.5, // 21px
    marginBottom: designSpacingSemantic.m, // 24px
  },
  bold: {
    fontFamily: plusJakartaSansFonts.bold,
    color: designColors.ink,
  },

  // ---------------------------------------------------------------------------
  // Field container — prototype .modal-field
  // ---------------------------------------------------------------------------
  fld: {
    marginBottom: designSpacingSemantic.m, // 24px
  },
  label: {
    fontFamily: plusJakartaSansFonts.bold, // weight 700
    fontSize: designFontSizes.xs, // 12px (--text-xs)
    color: designColors.ink,
    textTransform: "uppercase",
    letterSpacing: designFontSizes.xs * 0.1, // 0.1em
    marginBottom: designSpacingSemantic.xs, // 8px
  },

  // ---------------------------------------------------------------------------
  // Input — prototype .modal-field input
  // ---------------------------------------------------------------------------
  input: {
    width: "100%",
    fontFamily: plusJakartaSansFonts.medium, // weight 500
    fontSize: designFontSizes.m, // 16px (--text-m)
    color: designColors.ink,
    letterSpacing: designFontSizes.m * 0.1, // 0.1em
    paddingVertical: 16, // 1rem
    paddingHorizontal: 16,
    borderWidth: designBorders.standard, // 2px
    borderColor: designColors.ink,
    backgroundColor: designColors.field,
    borderRadius: 0, // Brutalist: NO border-radius
    // RN Web inherits the browser's blue focus ring unless explicitly reset.
    outlineWidth: 0,
  },
  // Focus state (applied via separate focused style)
  inputFocused: {
    backgroundColor: designColors.ground,
    // Shadow offset effect
    ...(hardShadowStyle(4, 4, designColors.ink, 0) as TextStyle),
    transform: [{ translateX: -2 }, { translateY: -2 }],
  },
  inputReadonly: {
    backgroundColor: designColors.field,
    color: designColors.inkMuted,
  },
  inputError: {
    borderColor: designColors.danger,
  },
  inputValid: {
    borderColor: DONE_GREEN,
  },

  // ---------------------------------------------------------------------------
  // Error + hint text
  // ---------------------------------------------------------------------------
  err: {
    fontFamily: plusJakartaSansFonts.semiBold,
    fontSize: designFontSizes.xs, // 12px
    color: designColors.danger,
    marginTop: designSpacingSemantic.xs, // 8px
    minHeight: 16,
  },
  hint: {
    fontFamily: plusJakartaSansFonts.regular,
    fontSize: designFontSizes.xs, // 12px
    color: designColors.inkMuted,
    marginTop: designSpacingSemantic.xs, // 8px
  },

  // ---------------------------------------------------------------------------
  // Actions row — prototype .modal-actions
  // ---------------------------------------------------------------------------
  actions: {
    flexDirection: "row",
    gap: designSpacingSemantic.s, // 16px
    marginTop: designSpacingSemantic.m, // 24px
  },

  // ---------------------------------------------------------------------------
  // Ghost button — prototype .btn-ghost
  // ---------------------------------------------------------------------------
  ghost: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: designColors.ground,
    borderWidth: designBorders.standard, // 2px
    borderColor: designColors.ink,
    borderRadius: 0, // Brutalist: NO border-radius
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostText: {
    fontFamily: plusJakartaSansFonts.bold, // weight 700
    fontSize: designFontSizes.s, // 14px (--text-s)
    color: designColors.ink,
    textTransform: "uppercase",
    letterSpacing: designFontSizes.s * 0.04, // 0.04em
  },

  // ---------------------------------------------------------------------------
  // Primary button — prototype .btn-primary (ink fill with arrow)
  // ---------------------------------------------------------------------------
  go: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: designColors.danger,
    borderWidth: designBorders.standard,
    borderColor: designColors.danger,
    borderRadius: 0, // Brutalist: NO border-radius
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  dangerButton: {
    backgroundColor: designColors.danger,
  },
  goText: {
    fontFamily: plusJakartaSansFonts.bold, // weight 700
    fontSize: designFontSizes.s, // 14px
    color: designColors.ground,
    textTransform: "uppercase",
    letterSpacing: designFontSizes.s * 0.04, // 0.04em
  },
  goDisabled: {
    opacity: 0.45,
  },

  // Arrow icon in button
  arrow: {
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: designFontSizes.s,
    color: designColors.ground,
  },

  // ---------------------------------------------------------------------------
  // OTP Input group — prototype .otp-input-group
  // ---------------------------------------------------------------------------
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: designSpacingSemantic.xs, // 8px
  },
  mobileWebOtpRow: { gap: 4 },
  otpBox: {
    width: OTP_BOX.width,
    height: OTP_BOX.height,
    borderWidth: designBorders.standard, // 2px
    borderColor: designColors.ink,
    backgroundColor: designColors.field,
    borderRadius: 0, // Brutalist: NO border-radius
    textAlign: "center",
    fontFamily: plusJakartaSansFonts.extraBold, // weight 800
    fontSize: designFontSizes.l, // 18px (--text-l)
    color: designColors.ink,
    padding: 0,
    letterSpacing: 0,
  },
  mobileWebOtpBox: { width: 40, height: 48, fontSize: 16 },
  otpBoxFocused: {
    backgroundColor: designColors.ground,
    ...(hardShadowStyle(4, 4, designColors.ink) as TextStyle),
    transform: [{ translateX: -2 }, { translateY: -2 }],
  },

  // ---------------------------------------------------------------------------
  // Resend timer — prototype .otp-resend
  // ---------------------------------------------------------------------------
  resendRow: {
    alignItems: "center",
    marginTop: designSpacingSemantic.m, // 24px
  },
  resendText: {
    fontFamily: plusJakartaSansFonts.regular,
    fontSize: designFontSizes.xs, // 12px
    color: designColors.inkMuted,
  },
  resendBtn: {
    backgroundColor: "transparent",
    padding: 4,
  },
  resendBtnText: {
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: designFontSizes.xs,
    color: designColors.ink,
    textDecorationLine: "underline",
  },
  resendBtnDisabled: {
    color: designColors.inkMuted,
    textDecorationLine: "none",
  },

  // ---------------------------------------------------------------------------
  // Signed-in state (avatar + name)
  // ---------------------------------------------------------------------------
  signedin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.field,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: plusJakartaSansFonts.extraBold,
    fontSize: designFontSizes.xl, // 20px
    color: designColors.ink,
  },
  signedName: {
    fontFamily: plusJakartaSansFonts.extraBold,
    fontSize: designFontSizes.m, // 16px
    color: designColors.ink,
  },
  signedEmail: {
    fontFamily: plusJakartaSansFonts.regular,
    fontSize: designFontSizes.xs, // 12px
    color: designColors.inkMuted,
  },

  // ---------------------------------------------------------------------------
  // Consent checkbox (register step)
  // ---------------------------------------------------------------------------
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: designSpacingSemantic.s, // 16px
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: designColors.ink,
  },
  checkboxMark: {
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 13,
    color: designColors.ground,
  },
  consentText: {
    flex: 1,
    fontFamily: plusJakartaSansFonts.regular,
    fontSize: designFontSizes.s, // 14px
    color: designColors.inkMuted,
    lineHeight: 19,
  },
  link: {
    fontFamily: plusJakartaSansFonts.bold,
    color: designColors.ink,
    textDecorationLine: "underline",
  },

  // ---------------------------------------------------------------------------
  // Done/success step
  // ---------------------------------------------------------------------------
  doneContainer: {
    alignItems: "center",
  },
  doneCheck: {
    width: 56,
    height: 56,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: DONE_GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  doneCheckMark: {
    fontFamily: plusJakartaSansFonts.extraBold,
    fontSize: 28,
    color: designColors.ground,
  },
  doneTitle: {
    marginTop: 14,
    textAlign: "center",
  },
  doneSub: {
    marginTop: 6,
    textAlign: "center",
  },
  doneActions: {
    marginTop: 20,
    width: "100%",
  },
});

export const componentStyles = StyleSheet.create({
  elementFlexShrink0: { flexShrink: 1 },
});

export function styleForLoginModalView0(): DynamicStyle {
  return { justifyContent: "flex-end", padding: 0 } as DynamicStyle;
}

export function styleForLoginModalAnimatedView1(
  arg0: Animated.Value,
  arg1: Animated.Value,
  arg2: Animated.Value,
  isMobileWeb = false,
): DynamicStyle {
  return {
    width: "100%",
    maxWidth: isMobileWeb ? "100%" : 400,
    maxHeight: isMobileWeb ? "92%" : Platform.OS === "web" ? undefined : "92%",
    opacity: arg0,
    transform: [{ scale: arg1 }, { translateY: arg2 }],
  } as DynamicStyle;
}

export function styleForLoginModalPressable2(): DynamicStyle {
  return {
    maxWidth: "100%",
    maxHeight: "100%",
    padding: 0,
    borderBottomWidth: 0,
    flexShrink: 1,
  } as DynamicStyle;
}

export function styleForLoginModalText3(): DynamicStyle {
  return { marginTop: 14 } as DynamicStyle;
}

export function styleForLoginModalView4(): DynamicStyle {
  return { zIndex: 10000, elevation: 10000 } as DynamicStyle;
}
