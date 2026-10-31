/** SNAP simulate-success / simulate-fail actions + verify note. */
import { Pressable, Text, View } from "react-native";

import type { SnapActionsProps } from "../interface";

export function SnapActions({ onSuccess, onFail }: SnapActionsProps) {
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Simulasikan pembayaran berhasil"
        onPress={onSuccess}
        testID="snap-success"
        className="items-center rounded-pill bg-brand py-3.5"
      >
        <Text className="text-sm font-extrabold text-white">
          Simulasikan pembayaran berhasil
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Simulasikan pembayaran gagal"
        onPress={onFail}
        testID="snap-fail"
        className="mt-2.5 items-center rounded-pill border border-line bg-card py-3.5"
      >
        <Text className="text-sm font-extrabold text-foreground">
          Simulasikan pembayaran gagal
        </Text>
      </Pressable>

      <Text className="mt-4.5 text-center text-2xs leading-5 text-muted-foreground">
        SNAP akan mengembalikan pengguna ke halaman hasil Rusuh Tiket. Halaman
        hasil tetap memverifikasi status dari backend.
      </Text>
    </View>
  );
}
