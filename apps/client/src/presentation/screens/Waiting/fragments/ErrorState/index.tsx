import { Pressable, Text, View } from "react-native";

import { styles } from "../../style";
import { QueueIcon } from "../QueueIcon";

export function ErrorState({
  icon,
  title,
  message,
  buttonText,
  onPress,
  testID,
}: {
  readonly icon: "warning" | "clock" | "ticket";
  readonly title: string;
  readonly message: string;
  readonly buttonText: string;
  readonly onPress: () => void;
  readonly testID: string;
}) {
  return (
    <View style={styles.errorState} testID={testID}>
      <View style={styles.iconCentered}>
        <QueueIcon kind={icon} />
      </View>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorText}>{message}</Text>
      <Pressable style={styles.errorBtn} onPress={onPress}>
        <Text style={styles.errorBtnText}>{buttonText}</Text>
      </Pressable>
    </View>
  );
}
