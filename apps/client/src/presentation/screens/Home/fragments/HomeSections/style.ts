import type { ViewStyle } from "react-native";
import { designColors, designSpacingSemantic } from "@presentation/theme";

function featuredSection(isNative: boolean, isMobileWeb: boolean): ViewStyle {
  return {
    backgroundColor:
      isNative || isMobileWeb ? designColors.ground : designColors.field,
    paddingTop: isMobileWeb ? 16 : designSpacingSemantic.xl,
    paddingHorizontal: isMobileWeb ? 16 : designSpacingSemantic.m,
    paddingBottom: isMobileWeb ? 20 : designSpacingSemantic.xl,
  };
}

function historySection(isMobileWeb: boolean): ViewStyle {
  return {
    paddingTop: isMobileWeb ? 8 : designSpacingSemantic.xl,
    paddingHorizontal: isMobileWeb ? 16 : designSpacingSemantic.m,
    paddingBottom: isMobileWeb ? 24 : designSpacingSemantic.xl,
  };
}

export const homeSectionsStyles = {
  featuredSection,
  historySection,
};
