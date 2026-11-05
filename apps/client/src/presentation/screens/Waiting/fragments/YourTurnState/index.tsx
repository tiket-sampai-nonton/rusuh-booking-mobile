import { ActivityIndicator, Text, View } from 'react-native';

import { COPY } from '../../display';
import { palette, styles } from '../../style';
import { LeaveButton } from '../LeaveButton';
import { RingProgress } from '../RingProgress';
import { StatusBadge } from '../StatusBadge';

interface YourTurnStateProps {
  readonly onLeavePress: () => void;
  readonly claiming: boolean;
}

export function YourTurnState({ onLeavePress, claiming }: YourTurnStateProps) {
  return (
    <>
      <StatusBadge variant="yourTurn" label="Giliran Anda!" />

      <RingProgress progress={1} position={0} />

      {claiming && (
        <View style={styles.prep}>
          <ActivityIndicator color={palette.green} />
          <Text style={styles.prepText}>{COPY.admitSub}</Text>
        </View>
      )}

      <LeaveButton onPress={onLeavePress} />
    </>
  );
}
