/** "Tinggalkan halaman ini?" confirm modal (prototype detail.html confirmBack). */
import { Modal, Pressable, Text, View } from "react-native";

import type { LeaveConfirmProps } from "../interface";

export function LeaveConfirm({ visible, onStay, onLeave }: LeaveConfirmProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onStay}>
      <Pressable
        accessibilityLabel="Tutup"
        onPress={onStay}
        className="flex-1 items-center justify-center bg-ink/70 p-5"
        testID="checkout-leave-backdrop"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-3xl border border-line bg-card p-6"
          testID="checkout-leave-modal"
        >
          <Text className="text-lg font-extrabold text-foreground" accessibilityRole="header">
            Tinggalkan halaman ini?
          </Text>
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">
            Kalau kamu keluar sekarang, sesi pemilihan tiket dilepas dan kamu harus
            mengulang antrean dari awal. Yakin mau keluar?
          </Text>
          <View className="mt-5 flex-row justify-end gap-2.5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tetap di sini"
              onPress={onStay}
              testID="checkout-stay"
              className="rounded-pill border border-line px-5 py-3"
            >
              <Text className="text-sm font-semibold text-foreground">Tetap di sini</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ya, keluar"
              onPress={onLeave}
              testID="checkout-leave-confirm"
              className="rounded-pill bg-error px-5 py-3"
            >
              <Text className="text-sm font-bold text-white">Ya, keluar ↗</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
