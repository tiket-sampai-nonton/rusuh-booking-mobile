import { Text, View } from "react-native";

import {
  browseHero,
  browseHeroCompactStyle,
  browseHeroEyebrow,
  browseHeroText,
  browseHeroTextStyle,
  browseHeroTitle,
} from "../../style";
import { styleForBrowseHeroView0 } from "./style";

interface BrowseHeroProps {
  readonly topInset: number;
  readonly isDesktop: boolean;
  readonly isMobileWeb?: boolean;
}

export function BrowseHero({
  topInset,
  isDesktop,
  isMobileWeb = false,
}: BrowseHeroProps) {
  return (
    <View
      style={[
        browseHero,
        styleForBrowseHeroView0(topInset, isMobileWeb),
        isMobileWeb && browseHeroCompactStyle,
      ]}
    >
      <View style={[browseHeroTitle, isMobileWeb && { marginBottom: 0 }]}>
        {isMobileWeb ? (
          <>
            <Text style={browseHeroEyebrow}>Temukan acara berikutnya</Text>
            <Text
              accessibilityRole="header"
              style={browseHeroTextStyle(isDesktop, true)}
            >
              Cari event
            </Text>
          </>
        ) : (
          <>
            <Text accessibilityRole="header" style={browseHeroText(isDesktop)}>
              Temukan
            </Text>
            <Text style={browseHeroText(isDesktop)}>Event Berikutnya</Text>
          </>
        )}
      </View>
    </View>
  );
}
