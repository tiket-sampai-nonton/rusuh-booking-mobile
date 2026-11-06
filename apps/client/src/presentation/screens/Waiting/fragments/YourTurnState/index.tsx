import { ActivityIndicator, Text, View } from 'react-native';

import { COPY } from '../../display';
import { palette, styles } from '../../style';
import { EventIntro } from '../EventIntro';
import { LeaveButton } from '../LeaveButton';
import { QueuePositionPanel } from '../QueuePositionPanel';

interface YourTurnStateProps {
  readonly onLeavePress: () => void;
  readonly claiming: boolean;
  readonly eventId: string;
  readonly isDesktop: boolean;
}

export function YourTurnState({
  onLeavePress,
  claiming,
  eventId,
  isDesktop,
}: YourTurnStateProps) {
  return (
    <>
      <EventIntro eventId={eventId} isDesktop={isDesktop} />

      <View style={[styles.dashboard, isDesktop && styles.dashboardDesktop]}>
        <QueuePositionPanel
          position={0}
          statusLabel="Giliran Anda"
          isDesktop={isDesktop}
        />
        <View style={[styles.yourTurnPanel, isDesktop && styles.yourTurnPanelDesktop]}>
          <Text style={styles.yourTurnTitle}>Giliran Anda!</Text>
          {claiming ? <ActivityIndicator color={palette.ink} /> : null}
          <Text style={styles.yourTurnText} accessibilityLiveRegion="polite">
            {COPY.admitSub}
          </Text>
        </View>
      </View>

      <View style={styles.waitingSpacer} />
      <View style={[styles.waitingFooter, isDesktop && styles.waitingFooterDesktop]}>
        <Text style={[styles.waitingFootnote, isDesktop && styles.waitingFootnoteDesktop]}>
          Posisi tersimpan dan diperbarui otomatis dari server. Giliranmu sedang diproses.
        </Text>
        <LeaveButton onPress={onLeavePress} isDesktop={isDesktop} />
      </View>
    </>
  );
}
