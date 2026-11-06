import { Text, View } from 'react-native';

import { formatDateID, formatTimeID } from '@domain/services/date-format';
import { useEventDetail } from '@presentation/hooks/useEventDetail';

import { styles } from '../../style';

interface EventIntroProps {
  readonly eventId: string;
  readonly isDesktop: boolean;
}

export function EventIntro({ eventId, isDesktop }: EventIntroProps) {
  const { data: event } = useEventDetail(eventId);
  const details = [
    formatDateID(event?.startsAt),
    formatTimeID(event?.startsAt),
    event?.venue,
  ].filter(Boolean);

  return (
    <View style={[styles.eventBlock, isDesktop && styles.eventBlockDesktop]}>
      <View style={styles.eventCopy}>
        <Text style={styles.eventEyebrow}>
          {isDesktop ? 'Ruang tunggu virtual · antrean aktif' : 'Ruang tunggu virtual'}
        </Text>
        {event?.name ? (
          <Text style={[styles.eventTitle, isDesktop && styles.eventTitleDesktop]}>
            {event.name}
          </Text>
        ) : null}
      </View>
      {details.length > 0 ? (
        <Text style={[styles.eventDetails, isDesktop && styles.eventDetailsDesktop]}>
          {details.join(' · ')}
        </Text>
      ) : null}
    </View>
  );
}
