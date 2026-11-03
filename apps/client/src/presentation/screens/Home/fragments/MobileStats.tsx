import { Text, View } from 'react-native';

import { v2Colors, v2Borders, interFonts } from '@presentation/theme';

const STATS = [
  { value: '50', label: 'Event' },
  { value: '100K+', label: 'Tiket Terjual' },
  { value: '25+', label: 'Kota' },
] as const;

/** The compact three-counter banner from v2-mobile/01-home.html. */
export function MobileStats() {
  return (
    <View
      testID="home-mobile-stats"
      style={{
        flexDirection: 'row',
        backgroundColor: v2Colors.ink,
        borderTopWidth: v2Borders.standard,
        borderBottomWidth: v2Borders.standard,
        borderColor: v2Colors.ink,
      }}
    >
      {STATS.map((stat, index) => (
        <View
          key={stat.label}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 24,
            paddingHorizontal: 8,
            borderLeftWidth: index === 0 ? 0 : v2Borders.standard,
            borderLeftColor: v2Colors.ground,
          }}
        >
          <Text style={{ color: v2Colors.ground, fontSize: 24, fontFamily: interFonts.black }}>
            {stat.value}
          </Text>
          <Text
            style={{
              marginTop: 4,
              color: v2Colors.ground,
              fontSize: 10,
              fontFamily: interFonts.bold,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              textAlign: 'center',
            }}
          >
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
