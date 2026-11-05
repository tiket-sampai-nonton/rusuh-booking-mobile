import { Pressable, Text } from 'react-native';

import { styles } from '../../style';

export function LeaveButton({ onPress }: { readonly onPress: () => void }) {
  return (
    <Pressable
      style={styles.leaveBtn}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Keluar dari Antrean"
      testID="waiting-leave"
    >
      <Text style={styles.leaveBtnText}>Keluar dari Antrean</Text>
    </Pressable>
  );
}
