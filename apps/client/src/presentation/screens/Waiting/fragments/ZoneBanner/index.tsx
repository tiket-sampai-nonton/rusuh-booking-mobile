import { Text, View } from 'react-native';

import type { QueueZone } from '@domain/repositories/queue.repository';
import { zoneCopy } from '../../display';
import { zoneBannerStyle, styles, zoneTextStyle } from '../../style';
import { QueueIcon } from '../QueueIcon';

export function ZoneBanner({ zone }: { readonly zone: QueueZone }) {
  const copy = zoneCopy(zone as "GUARANTEED" | "POSSIBLE" | "NOT_ENOUGH");

  return (
    <View
      testID="waiting-zone"
      accessibilityLiveRegion="polite"
      style={[styles.zone, zoneBannerStyle(copy.tone)]}
    >
      <QueueIcon kind={copy.icon} size={20} />
      <View style={styles.zoneTextWrap}>
        <Text style={[styles.zoneLabel, zoneTextStyle(copy.tone)]}>{copy.label}</Text>
        <Text style={[styles.zoneBody, zoneTextStyle(copy.tone)]}>{copy.body}</Text>
      </View>
    </View>
  );
}
