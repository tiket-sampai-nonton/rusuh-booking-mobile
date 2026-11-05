import type { ViewStyle } from "react-native";
import { StyleSheet } from 'react-native';
import { designBorders, designColors, interFonts } from '@presentation/theme';


export function ticketsScrollContent(topInset: number, bottomInset: number): ViewStyle {
  return {
    paddingTop: topInset + 88,
    paddingHorizontal: 16,
    paddingBottom: bottomInset + 88,
  };
}

export const screenStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: designColors.ground },
  title: { color: designColors.ink, fontFamily: interFonts.black, fontSize: 32, textTransform: 'uppercase' },
  description: { marginTop: 8, color: designColors.inkMuted, fontFamily: interFonts.regular, fontSize: 14 },
  error: { color: '#b91c1c', fontFamily: interFonts.medium, fontSize: 13 },
  loadMore: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderWidth: designBorders.standard, borderColor: designColors.ink },
  loadMoreLabel: { color: designColors.ink, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' },
  loading: { paddingVertical: 32, textAlign: 'center', color: designColors.inkMuted, fontFamily: interFonts.medium },
  downloadError: { marginTop: 12, color: '#b91c1c', fontFamily: interFonts.medium, fontSize: 12 },
  qrOverlay: { zIndex: 10000, elevation: 10000 },
});

export function historyContainerStyle(isWeb: boolean): ViewStyle {
  return {
    marginTop: 16,
    flexDirection: isWeb ? 'row' : 'column',
    flexWrap: isWeb ? 'wrap' : 'nowrap',
    justifyContent: 'flex-start',
    gap: isWeb ? 16 : 0,
  };
}

export function accountBookingColumnStyle(isWeb: boolean, width: number): ViewStyle {
  let flexBasis: ViewStyle['flexBasis'] = '100%';
  if (isWeb && width >= 1100) flexBasis = '31%';
  else if (isWeb && width >= 640) flexBasis = '48%';

  return {
    flexBasis,
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: isWeb ? 0 : 16,
  };
}
