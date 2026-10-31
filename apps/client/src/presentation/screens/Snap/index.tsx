/**
 * SnapSimulator PageScreen — parent component (orchestration only).
 *
 * 1:1 of the prototype `snap.html` (RBT-065, D10.5). Stands in for the Midtrans
 * SNAP hosted page: the mock `paymentSimulator` flips the attempt to
 * PAID/FAILED, then routes to the result page (the success page re-verifies
 * with getStatus — never trusts the callback alone, D10.2).
 *
 * This file wires hooks + the settle action and composes the fragments; all
 * markup lives in `./fragments/*`, all inline styles in `./style`, all types in
 * `./interface` (presentation refactor rule).
 */
import { useRouter, type Href } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { ScreenFade } from "@presentation/components/ScreenFade";
import { useSessionStore } from "@presentation/stores/session-store";
import { useServices } from "@providers/service-context";

import { SnapActions } from "./fragments/SnapActions";
import { SnapLogo } from "./fragments/SnapLogo";
import { SnapSummary } from "./fragments/SnapSummary";
import type { SnapSimulatorScreenProps } from "./interface";
import { snapStyles } from "./style";

export function SnapSimulatorScreen({ bookingId }: SnapSimulatorScreenProps) {
  const router = useRouter();
  const { paymentSimulator } = useServices();
  const attemptId = useSessionStore((s) => s.attemptId);
  const amountMinor = useSessionStore((s) => s.amountMinor);
  const method = useSessionStore((s) => s.paymentMethod);

  const settle = (outcome: "PAID" | "FAILED"): void => {
    // Drive the mock to the terminal status the BE webhook would set.
    if (attemptId && paymentSimulator) {
      paymentSimulator.simulateSnapResult(attemptId, outcome);
    }
    router.replace(
      (outcome === "PAID" ? `/success/${bookingId}` : `/expired/${bookingId}`) as Href,
    );
  };

  return (
    <ScreenFade>
      <View className="flex-1 bg-background" testID="snap-screen">
        <ScrollView contentContainerStyle={snapStyles.scrollContent}>
          <View className="w-full max-w-md self-center rounded-4xl border border-line bg-card p-7 shadow-filter">
            <SnapLogo />

            <Text
              className="mt-8 text-2xs font-extrabold uppercase tracking-tag text-brand"
              style={snapStyles.eyebrow}
            >
              Third-party payment gateway
            </Text>
            <Text
              className="mt-2 text-2xl font-extrabold text-foreground"
              style={snapStyles.heading}
              accessibilityRole="header"
            >
              Selesaikan pembayaranmu
            </Text>
            <Text className="mt-2.5 text-xs leading-5 text-muted-foreground">
              Ini adalah simulasi halaman SNAP untuk prototype. Pada produksi,
              halaman ini akan disediakan oleh payment provider.
            </Text>

            <SnapSummary bookingId={bookingId} method={method} amountMinor={amountMinor} />

            <SnapActions onSuccess={() => settle("PAID")} onFail={() => settle("FAILED")} />
          </View>
        </ScrollView>
      </View>
    </ScreenFade>
  );
}
