import { Text, View } from 'react-native';

import { browseHero, browseHeroText, browseHeroTitle } from '../../style';
import { styleForBrowseHeroView0 } from './style';

interface BrowseHeroProps {
  readonly topInset: number;
  readonly isDesktop: boolean;
}

export function BrowseHero({ topInset, isDesktop }: BrowseHeroProps) {
  return (
    <View style={[browseHero, styleForBrowseHeroView0(topInset)]}>
      <View style={browseHeroTitle}>
        <Text accessibilityRole="header" style={browseHeroText(isDesktop)}>
          Temukan
        </Text>
        <Text style={browseHeroText(isDesktop)}>Event Berikutnya</Text>
      </View>
    </View>
  );
}
