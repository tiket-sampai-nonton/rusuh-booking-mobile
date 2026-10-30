/**
 * SnapSimulatorScreen — local SNAP gateway simulator (RBT-065, D10.5).
 *
 * Stands in for the Midtrans SNAP hosted page (prototype `snap.html`). In
 * production the real gateway owns this UI and returns to success/failed via a
 * callback; here the mock `paymentSimulator` flips the attempt to PAID/FAILED
 * (the transition the BE webhook would make), then we route to the result page.
 * The success page still verifies status with getStatus (never trust the
 * callback alone — D10.2).
 */
import { useRouter, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useServices } from "@providers/service-context";
import { useSessionStore } from "@presentation/stores/session-store";

export interface SnapSimulatorScreenProps {
  readonly bookingId: string;
}

export function SnapSimulatorScreen({ bookingId }: SnapSimulatorScreenProps) {
  const router = useRouter();
  const { paymentSimulator } = useServices();
  const attemptId = useSessionStore((s) => s.attemptId);

  const settle = (outcome: "PAID" | "FAILED"): void => {
    // Drive the mock to the terminal status the BE webhook would set.
    if (attemptId && paymentSimulator) {
      paymentSimulator.simulateSnapResult(attemptId, outcome);
    }
    if (outcome === "PAID") {
      router.replace(`/success/${bookingId}` as Href);
    } else {
      router.replace(`/expired/${bookingId}` as Href);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-ink p-6" testID="snap-screen">
      <Text className="text-2xs font-bold uppercase tracking-tag text-white/60">
        SNAP · Payment Gateway (simulasi)
      </Text>
      <Text
        className="mt-3 text-xl font-extrabold text-white"
        accessibilityRole="header"
      >
        Selesaikan Pembayaran
      </Text>
      <Text className="mt-2 text-center text-sm text-white/70">
        Halaman ini mewakili SNAP (Midtrans). Pilih hasil untuk simulasi.
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Simulasikan pembayaran berhasil"
        onPress={() => settle("PAID")}
        testID="snap-success"
        className="mt-7.5 w-full items-center rounded-pill bg-ok py-4"
      >
        <Text className="text-md font-bold text-white">Bayar Berhasil ✓</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Simulasikan pembayaran gagal"
        onPress={() => settle("FAILED")}
        testID="snap-fail"
        className="mt-3 w-full items-center rounded-pill border border-white/30 py-4"
      >
        <Text className="text-md font-bold text-white">Bayar Gagal ✕</Text>
      </Pressable>
    </View>
  );
}
