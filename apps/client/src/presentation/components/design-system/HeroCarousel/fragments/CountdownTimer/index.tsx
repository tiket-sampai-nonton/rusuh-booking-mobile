import { Text, View } from 'react-native';

import type { ServerClock } from '@domain/services/server-clock';
import { useServerCountdown } from '@presentation/hooks/useServerCountdown';

import { componentStyles } from '../../style';

export function CountdownTimer({
  expiresAtIso,
  clock,
}: {
  readonly expiresAtIso: string;
  readonly clock: ServerClock;
}) {
  const { remainingMs } = useServerCountdown({ clock, expiresAtIso });
  const time = {
    days: Math.floor(remainingMs / (1000 * 60 * 60 * 24)),
    hours: Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    mins: Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)),
    secs: Math.floor((remainingMs % (1000 * 60)) / 1000),
  };

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <View
      style={componentStyles.elementFlexDirection3}
      testID="hero-countdown"
    >
      {[
        { value: pad(time.days), label: "Hari" },
        { value: pad(time.hours), label: "Jam" },
        { value: pad(time.mins), label: "Menit" },
        { value: pad(time.secs), label: "Detik" },
      ].map((item) => (
        <View key={item.label} style={componentStyles.elementAlignItems4}>
          <Text
            style={componentStyles.elementColor5}
          >
            {item.value}
          </Text>
          <Text
            style={componentStyles.elementColor6}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
