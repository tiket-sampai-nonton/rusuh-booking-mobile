import { Platform, Pressable, Text, View } from "react-native";

import { styles } from "../../style";
import { QueueIcon } from "../QueueIcon";

export function LeaveModal({
  visible,
  onStay,
  onLeave,
}: {
  readonly visible: boolean;
  readonly onStay: () => void;
  readonly onLeave: () => void;
}) {
  if (!visible) return null;

  return (
    <View
      style={[
        styles.modalOverlay,
        Platform.OS !== "web" && styles.modalOverlayNative,
      ]}
      testID="waiting-leave-modal"
    >
      <View
        style={[styles.modal, Platform.OS !== "web" && styles.modalPanelNative]}
      >
        <View style={styles.iconCentered}>
          <QueueIcon kind="warning" />
        </View>
        <Text style={styles.modalTitle}>Keluar dari Antrean?</Text>
        <Text style={styles.modalText}>
          Jika Anda keluar sekarang, posisi antrean akan hilang dan Anda harus
          bergabung kembali dari belakang.
        </Text>
        <View style={styles.modalActions}>
          <Pressable style={styles.modalBtnStay} onPress={onStay}>
            <Text style={styles.modalBtnStayText}>Tetap Mengantre</Text>
          </Pressable>
          <Pressable style={styles.modalBtnLeave} onPress={onLeave}>
            <Text style={styles.modalBtnLeaveText}>Keluar dari Antrean</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
