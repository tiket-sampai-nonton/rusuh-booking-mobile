import { Text } from 'react-native';

import type { QueueZone } from '@domain/repositories/queue.repository';
import { ringProgress } from '../../display';
import { styles } from '../../style';
import { EstimatedTime } from '../EstimatedTime';
import { LeaveButton } from '../LeaveButton';
import { RingProgress } from '../RingProgress';
import { StatusBadge } from '../StatusBadge';
import { ZoneBanner } from '../ZoneBanner';

interface WaitingActiveProps {
  readonly position: number;
  readonly admissionRatePerMin?: number;
  readonly zone: QueueZone;
  readonly onLeavePress: () => void;
}

export function WaitingActive({
  position,
  admissionRatePerMin,
  zone,
  onLeavePress,
}: WaitingActiveProps) {
  const progress = ringProgress(position);

  return (
    <>
      <StatusBadge variant="queue" label="Dalam Antrean" />

      <RingProgress
        progress={progress}
        position={position}
        isWarning={position <= 10}
      />

      <ZoneBanner zone={zone} />

      <EstimatedTime position={position} admissionRatePerMin={admissionRatePerMin} />

      <Text style={styles.infoText}>
        Jangan tutup halaman ini. Posisi antrean diperbarui otomatis. Jangan
        muat ulang atau tinggalkan halaman agar posisi Anda tetap terjaga.
      </Text>

      <LeaveButton onPress={onLeavePress} />
    </>
  );
}
