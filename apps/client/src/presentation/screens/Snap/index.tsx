/**
 * SnapSimulator PageScreen — parent component (orchestration only).
 *
 * 1:1 of the prototype `snap.html` (RBT-065, D10.5). Stands in for the Midtrans
 * SNAP hosted page: a simulate button drives the mock `snapCallback` (the port
 * method the real gateway webhook also implements — AC1), then routes to the
 * RESULT GATE which re-verifies with getStatus (never trusts the callback —
 * D10.2). A SUCCESS/UNKNOWN return goes to /payment-result (the gate keeps
 * verifying on UNKNOWN); a FAILED return goes to /expired with reason=payment.
 *
 * Markup lives in ./fragments/*, inline styles in ./style, types in ./interface.
 */
import { useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { SnapOutcome } from "@domain/repositories/payment.repository";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useSnapSimulator } from "@presentation/hooks/useSnapSimulator";
import { useSessionStore } from "@presentation/stores/session-store";
import { v2, v2Border } from "@presentation/theme";

import { SnapActions } from "./fragments/SnapActions";
import { SnapLogo } from "./fragments/SnapLogo";
import { SnapSummary } from "./fragments/SnapSummary";
import type { SnapSimulatorScreenProps } from "./interface";
import { snapStyles } from "./style";

export function SnapSimulatorScreen({ bookingId }: SnapSimulatorScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settle } = useSnapSimulator();
  const attemptId = useSessionStore((s) => s.attemptId);
  const amountMinor = useSessionStore((s) => s.amountMinor);
  const method = useSessionStore((s) => s.paymentMethod);
  const [channel, setChannel] = useState<"bank" | "wallet">("bank");
  const [bank, setBank] = useState("BCA");
  const [wallet, setWallet] = useState<string | null>(null);

  const run = (outcome: SnapOutcome): void => {
    const afterwards = (): void => {
      // FAILED → recovery screen; PAID/UNKNOWN → the verify gate (keeps polling
      // on UNKNOWN). The gate re-reads getStatus; we never render PAID here.
      const route =
        outcome === "FAILED"
          ? `/expired/${bookingId}?reason=payment&bookingId=${bookingId}`
          : `/payment-result/${bookingId}${attemptId ? `?attemptId=${attemptId}` : ""}`;
      router.replace(route as Href);
    };
    if (attemptId) {
      settle.mutate({ attemptId, outcome }, { onSettled: afterwards });
    } else {
      // No attempt in the store (edge) — still route to the gate to verify.
      afterwards();
    }
  };

  return (
    <ScreenFade>
      <View className="flex-1" style={{ backgroundColor: v2.field }} testID="snap-screen">
        <View
          style={{
            height: insets.top + 56,
            paddingTop: insets.top,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: v2.ground,
            borderBottomWidth: v2Border.base,
            borderBottomColor: v2.ink,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke pembayaran"
            onPress={() => router.back()}
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", borderWidth: v2Border.base, borderColor: v2.ink }}
          >
            <Text style={{ color: v2.ink, fontSize: 22 }}>‹</Text>
          </Pressable>
          <Text style={{ color: v2.ink, fontSize: 14, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>Pembayaran SNAP</Text>
          {/* The simulator has no server-authoritative expiry value to show here. */}
          <View style={{ width: 44 }} />
        </View>
        <ScrollView
          contentContainerStyle={[
            snapStyles.scrollContent,
            { paddingHorizontal: 24, paddingTop: 28, paddingBottom: insets.bottom + 40, width: "100%" },
          ]}
        >
          <View className="w-full max-w-md self-center" style={{ backgroundColor: v2.ground }}>
            <SnapLogo />

            <SnapSummary
              bookingId={bookingId}
              method={method}
              amountMinor={amountMinor}
            />

            <View style={{ marginBottom: 24 }}>
              <Text className="mb-3 text-xs font-extrabold uppercase" style={{ color: v2.ink, letterSpacing: 1.5 }}>Metode Pembayaran</Text>
              <View className="flex-row" style={{ borderWidth: v2Border.base, borderColor: v2.ink }}>
                {(["bank", "wallet"] as const).map((value) => (
                  <Pressable key={value} onPress={() => setChannel(value)} style={{ flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", backgroundColor: channel === value ? v2.ink : v2.ground }} testID={`snap-channel-${value}`}>
                    <Text style={{ color: channel === value ? v2.ground : v2.ink, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>{value === "bank" ? "Transfer Bank" : "Dompet Digital"}</Text>
                  </Pressable>
                ))}
              </View>
              {channel === "bank" ? (
                <>
                  <View className="mt-3 flex-row gap-2">
                    {["BCA", "BNI", "Mandiri"].map((value) => (
                      <Pressable key={value} onPress={() => setBank(value)} style={{ flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderWidth: v2Border.base, borderColor: v2.ink, backgroundColor: bank === value ? v2.field : v2.ground }}>
                        <Text style={{ color: v2.ink, fontSize: 12, fontWeight: "700" }}>{value}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View className="mt-3 p-4" style={{ borderWidth: v2Border.base, borderColor: v2.ink, backgroundColor: v2.field }}>
                    <Text className="text-xs font-bold uppercase" style={{ color: v2.ink }}>Akun virtual {bank}</Text>
                    <Text className="mt-2 text-xl font-extrabold" style={{ color: v2.ink }}>8800 1234 5678</Text>
                    <Text className="mt-2 text-xs" style={{ color: v2.gray }}>Transfer sesuai jumlah tagihan, lalu tunggu verifikasi pembayaran.</Text>
                  </View>
                </>
              ) : (
                <View className="mt-3 gap-3" style={{ borderWidth: v2Border.base, borderColor: v2.ink, padding: 16 }}>
                  {["GoPay", "QRIS"].map((value) => (
                    <Pressable
                      key={value}
                      accessibilityRole="button"
                      accessibilityState={{ selected: wallet === value }}
                      onPress={() => setWallet(value)}
                      style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 14, borderWidth: v2Border.base, borderColor: v2.ink, backgroundColor: wallet === value ? v2.field : v2.ground }}
                      testID={`snap-wallet-${value.toLowerCase()}`}
                    >
                      <Text style={{ color: v2.ink, fontSize: 13, fontWeight: "700" }}>{value}</Text>
                    </Pressable>
                  ))}
                  <Text className="text-xs" style={{ color: v2.gray }}>Pilih dompet digital di atas untuk melanjutkan pembayaran.</Text>
                </View>
              )}
            </View>

            <SnapActions
              pending={settle.isPending}
              onSuccess={() => run("PAID")}
              onFail={() => run("FAILED")}
              onUnknown={() => run("UNKNOWN")}
            />
          </View>
        </ScrollView>
      </View>
    </ScreenFade>
  );
}
