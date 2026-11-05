
import { StyleSheet } from 'react-native';
import { designBorders, designColors, interFonts } from '@presentation/theme';
import { hardShadowStyle } from '@presentation/utils/style';

import type { ViewStyle } from "react-native";
import { Platform } from "react-native";

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: designColors.ground,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    ...hardShadowStyle(4, 4, designColors.ink, 5),
  },
  title: {
    color: designColors.ink,
    fontFamily: interFonts.black,
    fontSize: 20,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  message: { marginTop: 24 },
  error: { marginTop: 24, color: '#b91c1c' },
  ticketQr: {
    marginTop: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  ticketCode: { marginTop: 8, color: designColors.ink, fontFamily: interFonts.bold },
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
    fontFamily: interFonts.regular,
    fontSize: 12,
    textAlign: 'center',
  },
  download: {
    marginTop: 12,
    minHeight: 44,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  downloadText: {
    color: designColors.ink,
    fontFamily: interFonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  errorText: { marginTop: 8, color: '#b91c1c', fontSize: 12 },
  close: {
    marginTop: 20,
    minHeight: 44,
    minWidth: 128,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: designColors.ink,
  },
  closeText: {
    color: designColors.ground,
    fontFamily: interFonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
});

export function ticketQrContentStyle(bottomInset: number): ViewStyle {
  return { padding: 24, alignItems: 'center', paddingBottom: bottomInset + 24 };
}

export function ticketQrBackdropStyle(platform: typeof Platform.OS): ViewStyle {
  return {
    ...styles.backdrop,
    justifyContent: platform === 'web' ? 'center' : 'flex-end',
    padding: platform === 'web' ? 24 : 0,
  };
}
