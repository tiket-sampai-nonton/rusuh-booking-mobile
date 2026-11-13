import { StyleSheet, type ViewStyle, Platform } from "react-native";
import {
  designBorders,
  designColors,
  plusJakartaSansFonts,
  withAlpha,
} from "@presentation/theme";
import { hardShadowStyle } from "@presentation/utils/style";

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    position: "relative",
    backgroundColor: withAlpha(designColors.overlay, 0.72),
    alignItems: "center",
  },
  backdropDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "90%",
    flexShrink: 1,
    zIndex: 1,
    elevation: 1,
    backgroundColor: designColors.ground,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    ...hardShadowStyle(4, 4, designColors.ink, 5),
  },
  scroll: { flexGrow: 0, flexShrink: 1 },
  title: {
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.extraBold,
    fontSize: 20,
    textTransform: "uppercase",
    textAlign: "center",
  },
  sectionTitle: {
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.extraBold,
    fontSize: 18,
    textTransform: "uppercase",
  },
  message: { marginTop: 24 },
  error: { marginTop: 24, color: designColors.danger },
  ticketQr: {
    marginTop: 20,
    width: "100%",
  },
  ticketCode: {
    marginTop: 8,
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.bold,
  },
  ticketDetails: {
    marginTop: 6,
    color: designColors.inkMuted,
    fontFamily: plusJakartaSansFonts.medium,
    fontSize: 12,
    textAlign: "center",
  },
  bookingSummary: {
    marginTop: 20,
    width: "100%",
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  bookingAmount: {
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 16,
  },
  fallbackQr: {
    marginTop: 24,
    padding: 16,
    backgroundColor: designColors.ground,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  instruction: {
    marginTop: 16,
    color: designColors.inkMuted,
    fontFamily: plusJakartaSansFonts.regular,
    fontSize: 12,
    textAlign: "center",
  },
  download: {
    marginTop: 12,
    minHeight: 44,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: designBorders.standard,
    borderColor: designColors.danger,
    backgroundColor: designColors.danger,
  },
  downloadText: {
    color: designColors.ground,
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
  errorText: { marginTop: 8, color: designColors.danger, fontSize: 12 },
  close: {
    marginTop: 20,
    minHeight: 44,
    minWidth: 128,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designColors.ink,
  },
  closeText: {
    color: designColors.ground,
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
});

export function ticketQrContentStyle(bottomInset: number): ViewStyle {
  return { padding: 24, alignItems: "center", paddingBottom: bottomInset + 24 };
}

export function ticketQrBackdropStyle(platform: typeof Platform.OS): ViewStyle {
  return {
    ...styles.backdrop,
    justifyContent: platform === "web" ? "center" : "flex-end",
    padding: platform === "web" ? 24 : 0,
  };
}
