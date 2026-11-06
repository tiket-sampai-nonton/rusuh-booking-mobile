import { Text, View } from 'react-native';

import type { QueueZone } from '@domain/repositories/queue.repository';
import { etaText, formatCount, peopleAhead } from '../../display';
import { styles } from '../../style';
import { EventIntro } from '../EventIntro';
import { LeaveButton } from '../LeaveButton';
import { QueuePositionPanel } from '../QueuePositionPanel';
import { QueueStat } from '../QueueStat';
import { ZoneBanner } from '../ZoneBanner';

interface WaitingActiveProps {
  readonly position: number;
  readonly admissionRatePerMin?: number;
  readonly zone: QueueZone;
  readonly onLeavePress: () => void;
  readonly eventId: string;
  readonly isDesktop: boolean;
}

export function WaitingActive({
  position,
  admissionRatePerMin,
  zone,
  onLeavePress,
  eventId,
  isDesktop,
}: WaitingActiveProps) {
  const estimate = etaText(position, admissionRatePerMin);

  return (
    <>
      <EventIntro eventId={eventId} isDesktop={isDesktop} />

      <View style={[styles.dashboard, isDesktop && styles.dashboardDesktop]}>
        <QueuePositionPanel
          position={position}
          statusLabel="Menunggu"
          isDesktop={isDesktop}
        />

        <View style={[styles.summary, isDesktop && styles.summaryDesktop]}>
          {isDesktop ? <Text style={[styles.summaryHeading, styles.summaryHeadingDesktop]}>Ringkasan antrean</Text> : null}
          <View style={[styles.ledgerStats, isDesktop && styles.ledgerStatsDesktop]}>
            <QueueStat
              label="Orang di depan"
              value={formatCount(peopleAhead(position))}
              testID="waiting-ahead"
              isDesktop={isDesktop}
            />
            <QueueStat
              label="Estimasi"
              value={estimate}
              testID="waiting-eta"
              isDesktop={isDesktop}
              isSecond
            />
          </View>
          <ZoneBanner zone={zone} isDesktop={isDesktop} />
        </View>
      </View>

      <View style={styles.waitingSpacer} />

      <View style={[styles.waitingFooter, isDesktop && styles.waitingFooterDesktop]}>
        <Text style={[styles.waitingFootnote, isDesktop && styles.waitingFootnoteDesktop]}>
          Posisi tersimpan dan diperbarui otomatis dari server. Tetap di halaman ini sampai giliranmu tiba.
        </Text>
        <LeaveButton onPress={onLeavePress} isDesktop={isDesktop} />
      </View>
    </>
  );
}
