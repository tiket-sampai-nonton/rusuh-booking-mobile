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
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { SnapOutcome } from "@domain/repositories/payment.repository";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useSnapSimulator } from "@presentation/hooks/useSnapSimulator";
import { useSessionStore } from "@presentation/stores/session-store";
import { useResponsive } from "@presentation/hooks/useResponsive";

import { SnapActions } from "./fragments/SnapActions";
import { SnapLogo } from "./fragments/SnapLogo";
import { SnapSummary } from "./fragments/SnapSummary";
import type { SnapSimulatorScreenProps } from "./interface";
import {
  snapStyles,
  componentStyles,
  styleForSnapSimulatorScreenView0,
  styleForSnapSimulatorScreenView1,
  styleForSnapSimulatorScreenView2,
  styleForSnapSimulatorScreenPressable3,
  styleForSnapSimulatorScreenText4,
  styleForSnapSimulatorScreenPressable5,
  styleForSnapSimulatorScreenPressable6,
} from "./style";

export function SnapSimulatorScreen({ bookingId }: SnapSimulatorScreenProps) {
  const insets = useSafeAreaInsets();
  const { isMobileWeb } = useResponsive();
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
      const route = paymentResultRoute(outcome, bookingId, attemptId);
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
      <View
        className="flex-1"
        style={componentStyles.elementBackgroundColor0}
        testID="snap-screen"
      >
        <View style={styleForSnapSimulatorScreenView0(insets)}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke pembayaran"
            onPress={() => router.back()}
            style={componentStyles.elementWidth1}
          >
            <Text style={componentStyles.elementColor2}>‹</Text>
          </Pressable>
          <Text style={componentStyles.elementColor3}>Pembayaran SNAP</Text>
          {/* The simulator has no server-authoritative expiry value to show here. */}
          <View style={componentStyles.elementWidth4} />
        </View>
        <ScrollView
          contentContainerStyle={[
            snapStyles.scrollContent,
            {
              paddingHorizontal: isMobileWeb ? 16 : 28,
              paddingTop: isMobileWeb ? 16 : 28,
              paddingBottom: insets.bottom + (isMobileWeb ? 24 : 40),
              width: "100%",
            },
          ]}
        >
          <View
            className="w-full max-w-md self-center"
            style={[
              styleForSnapSimulatorScreenView1(),
              Platform.OS !== "web" && styleForSnapSimulatorScreenView2(),
            ]}
            testID="snap-content"
          >
            <SnapLogo />

            <SnapSummary
              bookingId={bookingId}
              method={method}
              amountMinor={amountMinor}
            />

            <View style={componentStyles.elementMarginBottom5}>
              <Text
                className="mb-3 text-xs font-extrabold uppercase"
                style={componentStyles.elementColor6}
              >
                Metode Pembayaran
              </Text>
              <View
                className="flex-row"
                style={componentStyles.elementBorderWidth7}
              >
                {(["bank", "wallet"] as const).map((value) => (
                  <Pressable
                    key={value}
                    onPress={() => setChannel(value)}
                    style={styleForSnapSimulatorScreenPressable3(
                      channel,
                      value,
                    )}
                    testID={`snap-channel-${value}`}
                  >
                    <Text
                      style={styleForSnapSimulatorScreenText4(channel, value)}
                    >
                      {value === "bank" ? "Transfer Bank" : "Dompet Digital"}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {channel === "bank" ? (
                <>
                  <View className="mt-3 flex-row gap-2">
                    {["BCA", "BNI", "Mandiri"].map((value) => (
                      <Pressable
                        key={value}
                        onPress={() => setBank(value)}
                        style={styleForSnapSimulatorScreenPressable5(
                          bank,
                          value,
                        )}
                      >
                        <Text style={componentStyles.elementColor8}>
                          {value}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <View
                    className="mt-3 p-4"
                    style={componentStyles.elementBorderWidth9}
                  >
                    <Text
                      className="text-xs font-bold uppercase"
                      style={componentStyles.elementColor10}
                    >
                      Akun virtual {bank}
                    </Text>
                    <Text
                      className="mt-2 text-xl font-extrabold"
                      style={componentStyles.elementColor11}
                    >
                      8800 1234 5678
                    </Text>
                    <Text
                      className="mt-2 text-xs"
                      style={componentStyles.elementColor12}
                    >
                      Transfer sesuai jumlah tagihan, lalu tunggu verifikasi
                      pembayaran.
                    </Text>
                  </View>
                </>
              ) : (
                <View
                  className="mt-3 gap-3"
                  style={componentStyles.elementBorderWidth13}
                >
                  {["GoPay", "QRIS"].map((value) => (
                    <Pressable
                      key={value}
                      accessibilityRole="button"
                      accessibilityState={{ selected: wallet === value }}
                      onPress={() => setWallet(value)}
                      style={styleForSnapSimulatorScreenPressable6(
                        wallet,
                        value,
                      )}
                      testID={`snap-wallet-${value.toLowerCase()}`}
                    >
                      <Text style={componentStyles.elementColor14}>
                        {value}
                      </Text>
                    </Pressable>
                  ))}
                  <Text
                    className="text-xs"
                    style={componentStyles.elementColor15}
                  >
                    Pilih dompet digital di atas untuk melanjutkan pembayaran.
                  </Text>
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

function paymentResultRoute(
  outcome: SnapOutcome,
  bookingId: string,
  attemptId?: string,
): string {
  if (outcome === "FAILED") {
    return `/failed/${bookingId}?reason=payment&bookingId=${bookingId}`;
  }
  if (attemptId) return `/payment-result/${bookingId}?attemptId=${attemptId}`;
  return `/payment-result/${bookingId}`;
}
