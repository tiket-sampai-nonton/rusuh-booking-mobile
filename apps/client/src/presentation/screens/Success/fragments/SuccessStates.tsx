/** Success non-paid states: loading (verifying) + unverified fallback. */
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { AuraBackground } from "@presentation/components/AuraBackground";
import { TAP_MIN } from "@shared/utils/tap-target";

import type { SuccessUnverifiedProps } from "../interface";

export function SuccessLoading() {
  return (
    <AuraBackground tone="success" testID="success-loading">
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator accessibilityLabel="Memverifikasi pembayaran" color="#fff" />
        <Text className="mt-2 text-sm text-white/60">Menerbitkan e-tiket…</Text>
      </View>
    </AuraBackground>
  );
}

export function SuccessUnverified({ onHome }: SuccessUnverifiedProps) {
  return (
    <AuraBackground tone="error" testID="success-unverified">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-xl font-extrabold text-white" accessibilityRole="header">
          Pembayaran belum terkonfirmasi
        </Text>
        <Text className="mt-2 text-center text-sm text-white/60">
          Status pembayaran belum PAID. Jika kamu sudah membayar, tunggu sebentar
          lalu muat ulang.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ke Beranda"
          onPress={onHome}
          testID="success-home"
          style={{ minHeight: TAP_MIN, justifyContent: "center" }}
          className="mt-7.5 rounded-pill border border-white/20 px-6 py-3"
        >
          <Text className="text-sm font-bold text-white">Ke Beranda</Text>
        </Pressable>
      </View>
    </AuraBackground>
  );
}
