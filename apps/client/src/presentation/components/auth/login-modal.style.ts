/**
 * LoginModal V2 Brutalist Mono styles
 *
 * MATCHES: `.genesis/prototype/v2/01-home.html` lines ~1359-1520
 *
 * V2 Design Rules:
 * - Colors: ONLY #000, #fff, #666, #f5f5f5, #ff0000
 * - Borders: 2px solid black (NO border-radius)
 * - Shadows: hard offset, NO blur (4px 4px 0 #000)
 * - Fonts: Inter (weight 900 for titles, 700 for labels)
 * - Spacing: 48px modal padding (--space-l), 24px (--space-m) for fields
 */
import { Platform, StyleSheet } from "react-native";

import { interFonts } from "@presentation/theme/fonts";
import {
  v2Borders,
  v2Colors,
  v2FontSizes,
  v2Modal,
  v2SpacingSemantic,
} from "@presentation/theme/v2-tokens";

/**
 * Modal overlay — prototype rgba(0,0,0,0.8) + backdrop-filter blur(4px).
 * Note: blur is web-only; native uses plain dark overlay.
 */
export const SCRIM = "rgba(0,0,0,0.8)";

/**
 * Success green from prototype #16a34a (distinct from v2Colors.success).
 */
export const DONE_GREEN = "#16a34a";

/**
 * OTP input box dimensions (prototype: 48x56px).
 */
export const OTP_BOX = {
  width: 48,
  height: 56,
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
    padding: v2SpacingSemantic.s, // 16px
    // Web: backdrop-filter blur
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(4px)",
      WebkitBackdropFilter: "blur(4px)",
    }),
  },

  // ---------------------------------------------------------------------------
  // Modal card — prototype .modal
  // ---------------------------------------------------------------------------
  card: {
    width: "100%",
    maxWidth: v2Modal.maxWidth, // 400px
    backgroundColor: v2Colors.ground,
    borderWidth: v2Borders.standard, // 2px
    borderColor: v2Colors.ink,
    borderRadius: 0, // Brutalist: NO border-radius
    padding: v2Modal.padding, // 48px
    position: "relative",
  },

  // ---------------------------------------------------------------------------
  // Close button — prototype .modal-close
  // ---------------------------------------------------------------------------
  closeBtn: {
    position: "absolute",
    top: v2SpacingSemantic.s, // 16px
    right: v2SpacingSemantic.s,
    width: 40,
    height: 40,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.ground,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeBtnText: {
    fontFamily: interFonts.bold,
    fontSize: 20,
    color: v2Colors.ink,
    lineHeight: 20,
  },

  // ---------------------------------------------------------------------------
  // Typography
  // ---------------------------------------------------------------------------
  title: {
    fontFamily: interFonts.black, // weight 900
    fontSize: v2FontSizes.l, // 18px (--text-l)
    color: v2Colors.ink,
    textTransform: "uppercase",
    letterSpacing: v2FontSizes.l * -0.02, // -0.02em
    marginBottom: v2SpacingSemantic.xs, // 8px
  },
  sub: {
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.s, // 14px (--text-s)
    color: v2Colors.inkMuted, // #666
    lineHeight: v2FontSizes.s * 1.5, // 21px
    marginBottom: v2SpacingSemantic.m, // 24px
  },
  bold: {
    fontFamily: interFonts.bold,
    color: v2Colors.ink,
  },

  // ---------------------------------------------------------------------------
  // Field container — prototype .modal-field
  // ---------------------------------------------------------------------------
  fld: {
    marginBottom: v2SpacingSemantic.m, // 24px
  },
  label: {
    fontFamily: interFonts.bold, // weight 700
    fontSize: v2FontSizes.xs, // 12px (--text-xs)
    color: v2Colors.ink,
    textTransform: "uppercase",
    letterSpacing: v2FontSizes.xs * 0.1, // 0.1em
    marginBottom: v2SpacingSemantic.xs, // 8px
  },

  // ---------------------------------------------------------------------------
  // Input — prototype .modal-field input
  // ---------------------------------------------------------------------------
  input: {
    width: "100%",
    fontFamily: interFonts.medium, // weight 500
    fontSize: v2FontSizes.m, // 16px (--text-m)
    color: v2Colors.ink,
    letterSpacing: v2FontSizes.m * 0.1, // 0.1em
    paddingVertical: 16, // 1rem
    paddingHorizontal: 16,
    borderWidth: v2Borders.standard, // 2px
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.field, // #f5f5f5
    borderRadius: 0, // Brutalist: NO border-radius
  },
  // Focus state (applied via separate focused style)
  inputFocused: {
    backgroundColor: v2Colors.ground,
    // Shadow offset effect
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
    transform: [{ translateX: -2 }, { translateY: -2 }],
  },
  inputReadonly: {
    backgroundColor: v2Colors.field,
    color: v2Colors.inkMuted,
  },
  inputError: {
    borderColor: v2Colors.danger, // #ff0000
  },
  inputValid: {
    borderColor: DONE_GREEN,
  },

  // ---------------------------------------------------------------------------
  // Error + hint text
  // ---------------------------------------------------------------------------
  err: {
    fontFamily: interFonts.semiBold,
    fontSize: v2FontSizes.xs, // 12px
    color: v2Colors.danger, // #ff0000
    marginTop: v2SpacingSemantic.xs, // 8px
    minHeight: 16,
  },
  hint: {
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.xs, // 12px
    color: v2Colors.inkMuted, // #666
    marginTop: v2SpacingSemantic.xs, // 8px
  },

  // ---------------------------------------------------------------------------
  // Actions row — prototype .modal-actions
  // ---------------------------------------------------------------------------
  actions: {
    flexDirection: "row",
    gap: v2SpacingSemantic.s, // 16px
    marginTop: v2SpacingSemantic.m, // 24px
  },

  // ---------------------------------------------------------------------------
  // Ghost button — prototype .btn-ghost
  // ---------------------------------------------------------------------------
  ghost: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: v2Colors.ground,
    borderWidth: v2Borders.standard, // 2px
    borderColor: v2Colors.ink,
    borderRadius: 0, // Brutalist: NO border-radius
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostText: {
    fontFamily: interFonts.bold, // weight 700
    fontSize: v2FontSizes.s, // 14px (--text-s)
    color: v2Colors.ink,
    textTransform: "uppercase",
    letterSpacing: v2FontSizes.s * 0.04, // 0.04em
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
    backgroundColor: v2Colors.ink, // black
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    borderRadius: 0, // Brutalist: NO border-radius
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  goText: {
    fontFamily: interFonts.bold, // weight 700
    fontSize: v2FontSizes.s, // 14px
    color: v2Colors.ground, // white
    textTransform: "uppercase",
    letterSpacing: v2FontSizes.s * 0.04, // 0.04em
  },
  goDisabled: {
    opacity: 0.45,
  },

  // Arrow icon in button
  arrow: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.s,
    color: v2Colors.ground,
  },

  // ---------------------------------------------------------------------------
  // OTP Input group — prototype .otp-input-group
  // ---------------------------------------------------------------------------
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: v2SpacingSemantic.xs, // 8px
  },
  otpBox: {
    width: OTP_BOX.width,
    height: OTP_BOX.height,
    borderWidth: v2Borders.standard, // 2px
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.field,
    borderRadius: 0, // Brutalist: NO border-radius
    textAlign: "center",
    fontFamily: interFonts.black, // weight 900
    fontSize: v2FontSizes.l, // 18px (--text-l)
    color: v2Colors.ink,
    padding: 0,
    letterSpacing: 0,
  },
  otpBoxFocused: {
    backgroundColor: v2Colors.ground,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    transform: [{ translateX: -2 }, { translateY: -2 }],
  },

  // ---------------------------------------------------------------------------
  // Resend timer — prototype .otp-resend
  // ---------------------------------------------------------------------------
  resendRow: {
    alignItems: "center",
    marginTop: v2SpacingSemantic.m, // 24px
  },
  resendText: {
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.xs, // 12px
    color: v2Colors.inkMuted,
  },
  resendBtn: {
    backgroundColor: "transparent",
    padding: 4,
  },
  resendBtnText: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.xs,
    color: v2Colors.ink,
    textDecorationLine: "underline",
  },
  resendBtnDisabled: {
    color: v2Colors.inkMuted,
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
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.field,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: interFonts.black,
    fontSize: v2FontSizes.xl, // 20px
    color: v2Colors.ink,
  },
  signedName: {
    fontFamily: interFonts.black,
    fontSize: v2FontSizes.m, // 16px
    color: v2Colors.ink,
  },
  signedEmail: {
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.xs, // 12px
    color: v2Colors.inkMuted,
  },

  // ---------------------------------------------------------------------------
  // Consent checkbox (register step)
  // ---------------------------------------------------------------------------
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: v2SpacingSemantic.s, // 16px
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.ground,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: v2Colors.ink,
  },
  checkboxMark: {
    fontFamily: interFonts.bold,
    fontSize: 13,
    color: v2Colors.ground,
  },
  consentText: {
    flex: 1,
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.s, // 14px
    color: v2Colors.inkMuted,
    lineHeight: 19,
  },
  link: {
    fontFamily: interFonts.bold,
    color: v2Colors.ink,
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
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    backgroundColor: DONE_GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  doneCheckMark: {
    fontFamily: interFonts.black,
    fontSize: 28,
    color: v2Colors.ground,
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
