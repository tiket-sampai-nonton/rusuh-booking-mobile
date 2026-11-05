import { Pressable, Text, View } from "react-native";
import { styles } from "./style";


export interface RecoveryActionsProps {
  readonly canRetry: boolean;
  readonly primaryText: string;
  readonly showHome: boolean;
  readonly onRetry: () => void;
  readonly onRequeue: () => void;
  readonly onHome: () => void;
}

export function RecoveryActions({ canRetry, primaryText, showHome, onRetry, onRequeue, onHome }: RecoveryActionsProps) {
  return (
    <View className="w-full max-w-sm gap-3">
      <Pressable
        onPress={canRetry ? onRetry : onRequeue}
        accessibilityRole="button"
        accessibilityLabel={primaryText}
        testID={canRetry ? "expired-retry" : "expired-requeue"}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryText}>{primaryText}</Text>
      </Pressable>
      {showHome ? (
        <Pressable
          onPress={onHome}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Beranda"
          testID="expired-home"
          style={styles.secondaryButton}
        >
          <Text style={styles.homeText}>Kembali ke Beranda</Text>
        </Pressable>
      ) : null}
      {canRetry ? (
        <Pressable
          onPress={onRequeue}
          accessibilityRole="button"
          accessibilityLabel="Cari Event Lain"
          testID="expired-requeue"
          style={styles.requeueButton}
        >
          <Text style={styles.requeueText}>Cari Event Lain</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
