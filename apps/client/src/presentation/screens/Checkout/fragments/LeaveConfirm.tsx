/**
 * RBT-092 — V2 Brutalist Mono Leave Confirm Modal
 *
 * PROTOTYPE 03-checkout.html .modal EXACT COPY:
 * - Dark overlay (rgba(0,0,0,0.8))
 * - 2px solid border, no rounded corners
 * - Uppercase button labels
 * - Black/white color scheme
 */
import { Modal, Pressable, Text, View, StyleSheet } from "react-native";

import { v2Colors, v2Borders, interFonts } from "@presentation/theme";

import type { LeaveConfirmProps } from "../interface";

export function LeaveConfirm({ visible, onStay, onLeave }: LeaveConfirmProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onStay}>
      <Pressable
        accessibilityLabel="Tutup"
        onPress={onStay}
        style={styles.overlay}
        testID="checkout-leave-backdrop"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={styles.modal}
          testID="checkout-leave-modal"
        >
          <Text style={styles.title} accessibilityRole="header">
            ⚠️ Tinggalkan halaman?
          </Text>
          <Text style={styles.body}>
            Kalau kamu keluar sekarang, sesi pemilihan tiket dilepas dan kamu harus
            mengulang antrean dari awal. Yakin mau keluar?
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 32,
  },
  modal: {
    width: "100%",
    maxWidth: 400,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.ground,
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontFamily: interFonts.black,
    textTransform: "uppercase",
    letterSpacing: -0.4,
    color: v2Colors.ink,
    textAlign: "center",
    marginBottom: 16,
  },
  body: {
    fontSize: 14,
    fontFamily: interFonts.regular,
    lineHeight: 22,
    color: v2Colors.gray,
    textAlign: "center",
    marginBottom: 32,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  stayButton: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.ink,
    alignItems: "center",
  },
  stayButtonText: {
    fontSize: 12,
    fontFamily: interFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: v2Colors.ground,
  },
  leaveButton: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.ground,
    alignItems: "center",
  },
  leaveButtonText: {
    fontSize: 12,
    fontFamily: interFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: v2Colors.ink,
  },
});
