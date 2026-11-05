
import { StyleSheet } from 'react-native';
import { interFonts, designColors } from '@presentation/theme';

import type { DynamicStyle } from "@presentation/utils/style";

export const componentStyles = StyleSheet.create({
  elementPosition0: { position: 'absolute', top: 24, left: 24, width: 24, height: 24, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#ffffff33' },
  elementPosition1: { position: 'absolute', top: 24, right: 24, width: 24, height: 24, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#ffffff33' },
  elementPosition2: { position: 'absolute', bottom: 24, left: 24, width: 24, height: 24, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#ffffff33' },
  elementPosition3: { position: 'absolute', right: 24, bottom: 24, width: 24, height: 24, borderRightWidth: 2, borderBottomWidth: 2, borderColor: '#ffffff33' },
  elementPosition4: { position: 'absolute', top: 28, right: 56, color: '#ffffff66', fontFamily: interFonts.bold, fontSize: 10, letterSpacing: 1 },
  elementAlignItems5: { alignItems: 'center', gap: 16 },
  elementColor6: { color: designColors.ink, fontFamily: interFonts.black, fontSize: 48, lineHeight: 54 },
  elementFlexDirection7: { flexDirection: 'row', gap: 12 },
  elementFlexDirection8: { flexDirection: 'row' },
  elementFlexDirection9: { flexDirection: 'row' },
  elementColor10: { color: '#ffffff99', fontFamily: interFonts.medium, fontSize: 14, letterSpacing: 2 },
  elementPosition11: { position: 'absolute', right: 40, bottom: 70, left: 40, alignItems: 'center', gap: 10 },
  elementWidth12: { width: '100%', height: 2, overflow: 'hidden', backgroundColor: '#ffffff33' },
  elementColor13: { color: '#ffffff66', fontFamily: interFonts.semiBold, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },
});

export function styleForNativeLaunchSplashAnimatedView1(): DynamicStyle {
  return { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 9999, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: designColors.ink } as DynamicStyle;
}

export function styleForNativeLaunchSplashAnimatedView2(): DynamicStyle {
  return { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: designColors.ground, borderWidth: 3, borderColor: designColors.ground } as DynamicStyle;
}

export function styleForNativeLaunchSplashAnimatedView3(): DynamicStyle {
  return { height: '100%', backgroundColor: designColors.ground } as DynamicStyle;
}
