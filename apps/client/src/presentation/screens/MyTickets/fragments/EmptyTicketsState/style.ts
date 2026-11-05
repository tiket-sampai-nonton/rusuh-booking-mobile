
import { StyleSheet } from 'react-native';
import { designColors, designBorders, interFonts } from '@presentation/theme';

export const styles = StyleSheet.create({
  container: {
    paddingVertical: 56,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: designBorders.standard,
    borderStyle: 'dashed',
    borderColor: designColors.ink,
  },
  title: {
    color: designColors.ink,
    fontFamily: interFonts.black,
    fontSize: 20,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  description: {
    marginTop: 10,
    color: designColors.inkMuted,
    fontFamily: interFonts.regular,
    fontSize: 13,
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 20,
    minHeight: 44,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: designColors.ink,
  },
  browseLabel: {
    color: designColors.ground,
    fontFamily: interFonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
