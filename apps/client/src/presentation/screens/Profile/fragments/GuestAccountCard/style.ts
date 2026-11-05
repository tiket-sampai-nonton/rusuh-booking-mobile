
import { StyleSheet } from 'react-native';
import { interFonts, designBorders, designColors } from '@presentation/theme';

export const styles = StyleSheet.create({
  card: {
    marginTop: 24,
    padding: 20,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.field,
  },
  title: {
    color: designColors.ink,
    fontFamily: interFonts.black,
    fontSize: 20,
    textTransform: 'uppercase',
  },
  description: {
    marginTop: 8,
    color: designColors.inkMuted,
    fontFamily: interFonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  button: {
    marginTop: 18,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: designColors.ink,
  },
  buttonText: {
    color: designColors.ground,
    fontFamily: interFonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
