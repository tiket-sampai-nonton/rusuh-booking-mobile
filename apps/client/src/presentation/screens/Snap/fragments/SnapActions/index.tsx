/**  brutalist SNAP simulate-success / -fail / -unknown actions + verify note. */
import { Pressable, Text, View } from "react-native";

import { designBorders, designColors } from "@presentation/theme";

import type { SnapActionsProps } from "../../interface";
import {
  componentStyles,
  styleForSnapActionsPressable0,
  styleForSnapActionsPressable1,
  styleForSnapActionsPressable2,
} from "./style";

export function SnapActions({
  onSuccess,
  onFail,
  onUnknown,
  pending = false,
}: SnapActionsProps) {
  const btnBase = {
    borderWidth: designBorders.standard,
    opacity: pending ? 0.5 : 1,
  };
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
        style={styleForSnapActionsPressable0(btnBase)}
      >
        <Text
          className="text-sm font-bold uppercase"
          style={[
            componentStyles.elementLetterSpacing0,
            { color: designColors.ground },
          ]}
        >
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
        style={styleForSnapActionsPressable1(btnBase)}
      >
        <Text
          className="text-sm font-bold uppercase"
          style={componentStyles.elementColor1}
        >
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
        style={styleForSnapActionsPressable2(btnBase)}
      >
        <Text
          className="text-sm font-bold uppercase"
          style={componentStyles.elementColor2}
        >
          Simulasikan status belum pasti (verifying)
        </Text>
      </Pressable>

      <Text
        className="mt-4 pt-4 text-center text-2xs leading-5"
        style={componentStyles.elementColor3}
      >
        SNAP akan mengembalikan pengguna ke halaman hasil Rusuh Tiket. Halaman
        hasil tetap memverifikasi status dari backend.
      </Text>
    </View>
  );
}
