import { Text, View } from 'react-native';

import type { QueueZone } from '@domain/repositories/queue.repository';
import { zoneCopy } from '../../display';
import { palette, styles } from '../../style';
import { QueueIcon } from '../QueueIcon';

export function ZoneBanner({
  zone,
  isDesktop,
}: {
  readonly zone: QueueZone;
  readonly isDesktop: boolean;
}) {
  const copy = zoneCopy(zone as "GUARANTEED" | "POSSIBLE" | "NOT_ENOUGH");
  const icon = copy.icon === 'warning' ? 'ledger' : copy.icon;

  return (
    <View
      testID="waiting-zone"
      accessibilityLiveRegion="polite"
      style={[styles.zoneLedger, isDesktop && styles.zoneLedgerDesktop]}
    >
      <View style={[styles.zoneMarker, isDesktop && styles.zoneMarkerDesktop]}>
        <QueueIcon kind={icon} size={isDesktop ? 34 : 26} color={palette.ink} />
      </View>
      <View style={styles.zoneTextWrap}>
        <Text style={[styles.zoneTitleLedger, isDesktop && styles.zoneTitleLedgerDesktop]}>{copy.label}</Text>
        <Text style={[styles.zoneBodyLedger, isDesktop && styles.zoneBodyLedgerDesktop]}>{copy.body}</Text>
      </View>
    </View>
  );
}
