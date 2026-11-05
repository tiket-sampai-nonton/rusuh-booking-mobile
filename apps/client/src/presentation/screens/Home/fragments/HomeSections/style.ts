import { StyleSheet, type ViewStyle } from 'react-native';
import { designColors, designSpacingSemantic } from '@presentation/theme';

const styles = StyleSheet.create({
  historySection: {
    paddingTop: designSpacingSemantic.xl,
    paddingHorizontal: designSpacingSemantic.m,
    paddingBottom: designSpacingSemantic.xl,
  },
});

function featuredSection(isNative: boolean): ViewStyle {
  return {
    backgroundColor: isNative ? designColors.ground : designColors.field,
    paddingTop: designSpacingSemantic.xl,
    paddingHorizontal: designSpacingSemantic.m,
    paddingBottom: designSpacingSemantic.xl,
  };
}

export const homeSectionsStyles = {
  featuredSection,
  historySection: styles.historySection,
};
