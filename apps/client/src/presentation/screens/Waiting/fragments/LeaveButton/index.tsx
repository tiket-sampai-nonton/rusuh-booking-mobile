import { Pressable, Text } from "react-native";

import { styles } from "../../style";

export function LeaveButton({
  onPress,
  isDesktop = false,
}: {
  readonly onPress: () => void;
  readonly isDesktop?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.leaveBtn,
        isDesktop ? styles.leaveBtnDesktop : styles.leaveBtnMobile,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Keluar dari Antrean"
      testID="waiting-leave"
    >
      <Text
        style={[
          styles.leaveBtnText,
          isDesktop ? styles.leaveBtnTextDesktop : styles.leaveBtnTextMobile,
        ]}
      >
        Keluar dari Antrean
      </Text>
    </Pressable>
  );
}
