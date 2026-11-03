/** V2 brutalist SNAP simulate-success / -fail / -unknown actions + verify note. */
import { Pressable, Text, View } from "react-native";

import { v2, v2Border } from "@presentation/theme";

import type { SnapActionsProps } from "../interface";

export function SnapActions({
  onSuccess,
  onFail,
  onUnknown,
  pending = false,
}: SnapActionsProps) {
  const btnBase = { borderWidth: v2Border.base, opacity: pending ? 0.5 : 1 };
  return (
    <View className="gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Simulasikan pembayaran berhasil"
        accessibilityState={{ disabled: pending }}
        disabled={pending}
        onPress={onSuccess}
        testID="snap-success"
        className="items-center py-3.5"
        style={{ ...btnBase, backgroundColor: v2.success, borderColor: v2.success }}
      >
        <Text className="text-sm font-bold uppercase text-white" style={{ letterSpacing: 0.5 }}>
          Simulasikan pembayaran berhasil
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Simulasikan pembayaran gagal"
        accessibilityState={{ disabled: pending }}
        disabled={pending}
        onPress={onFail}
        testID="snap-fail"
        className="items-center py-3.5"
        style={{ ...btnBase, backgroundColor: v2.ground, borderColor: v2.ink }}
      >
        <Text className="text-sm font-bold uppercase" style={{ color: v2.ink, letterSpacing: 0.5 }}>
          Simulasikan pembayaran gagal
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Simulasikan status belum pasti"
        accessibilityState={{ disabled: pending }}
        disabled={pending}
        onPress={onUnknown}
        testID="snap-unknown"
        className="items-center py-3.5"
        style={{ ...btnBase, backgroundColor: v2.ground, borderColor: v2.ink }}
      >
        <Text className="text-sm font-bold uppercase" style={{ color: v2.gray, letterSpacing: 0.5 }}>
          Simulasikan status belum pasti (verifying)
        </Text>
      </Pressable>

      <Text
        className="mt-4 pt-4 text-center text-2xs leading-5"
        style={{ color: v2.inkMuted, borderTopWidth: 1, borderTopColor: v2.field }}
      >
        SNAP akan mengembalikan pengguna ke halaman hasil Rusuh Tiket. Halaman
        hasil tetap memverifikasi status dari backend.
      </Text>
    </View>
  );
}
