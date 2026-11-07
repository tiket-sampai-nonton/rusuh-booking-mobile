/**
 * RBT-092 —  Brutalist Mono Leave Confirm Modal
 *
 * PROTOTYPE 03-checkout.html .modal EXACT COPY:
 * - Token-based overlay color with alpha
 * - 2px solid border, no rounded corners
 * - Uppercase button labels
 * - Black/white color scheme
 */
import { Modal, Platform, Pressable, Text, View } from "react-native";

import type { LeaveConfirmProps } from "../../interface";
import { styles } from "./style";
import {
  styleForLeaveConfirmPressable0,
  styleForLeaveConfirmPressable1,
} from "./style";

export function LeaveConfirm({
  visible,
  onStay,
  onLeave,
  variant = "checkout",
}: LeaveConfirmProps & { readonly variant?: "checkout" | "payment" }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onStay}
    >
      <Pressable
        accessibilityLabel="Tutup"
        onPress={onStay}
        style={[
          styles.overlay,
          Platform.OS !== "web" && styleForLeaveConfirmPressable0(),
        ]}
        testID="checkout-leave-backdrop"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.modal,
            Platform.OS !== "web" && styleForLeaveConfirmPressable1(),
          ]}
          testID="checkout-leave-modal"
        >
          <Text style={styles.title} accessibilityRole="header">
            {variant === "payment"
              ? "Tinggalkan pembayaran?"
              : "Tinggalkan halaman?"}
          </Text>
          <Text style={styles.body}>
            {variant === "payment"
              ? "Kamu akan keluar dari proses pembayaran. Status transaksi tetap perlu dikonfirmasi sebelum mencoba lagi. Yakin mau keluar?"
              : "Kalau kamu keluar sekarang, sesi pemilihan tiket dilepas dan kamu harus mengulang antrean dari awal. Yakin mau keluar?"}
          </Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tetap di sini"
              onPress={onStay}
              testID="checkout-stay"
              style={styles.stayButton}
            >
              <Text style={styles.stayButtonText}>Tetap di sini</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ya, keluar"
              onPress={onLeave}
              testID="checkout-leave-confirm"
              style={styles.leaveButton}
            >
              <Text style={styles.leaveButtonText}>Ya, keluar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
