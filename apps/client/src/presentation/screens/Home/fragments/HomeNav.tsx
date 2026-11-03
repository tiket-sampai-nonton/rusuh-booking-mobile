/**
 * V2 Brutalist Mono nav (RBT-088) — replaces the V5 glass pill.
 *
 * Prototype 01-home `.header`: a fixed white bar with a hard 2px bottom border,
 * an uppercase wordmark, center links (web > 720px) and a "Masuk / Daftar" CTA.
 * Pure black/white; no shadow, no rounding. Links scroll in-page; the CTA opens
 * the login modal. Same props/wiring as before — this is a restyle only.
 */
import { Pressable, Text, View } from "react-native";

import { v2 } from "@presentation/theme";

import type { HomeNavProps } from "../interface";

export function HomeNav({
  showLinks,
  topInset,
  onJelajah,
  onHistory,
  onKategori,
  onAccount,
}: HomeNavProps) {
  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", top: 0, left: 0, right: 0, paddingTop: topInset }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: v2.ground,
          borderBottomWidth: 2,
          borderBottomColor: v2.ink,
          paddingHorizontal: 20,
          paddingVertical: 14,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{ color: v2.ink, letterSpacing: 0.5 }}
          className="text-lg font-v2 font-black uppercase"
        >
          Rusuh Tiket
        </Text>

        {showLinks ? (
          <View className="flex-row" style={{ gap: 24 }}>
            {[
              { label: "Jelajah", onPress: onJelajah, testID: "nav-jelajah" },
              { label: "History", onPress: onHistory, testID: "nav-history" },
              { label: "Kategori", onPress: onKategori, testID: "nav-kategori" },
            ].map((l) => (
              <Pressable
                key={l.testID}
                accessibilityRole="button"
                accessibilityLabel={`${l.label} event`}
                testID={l.testID}
                onPress={l.onPress}
              >
                <Text
                  style={{ color: v2.ink }}
                  className="text-sm font-v2 font-bold uppercase"
                >
                  {l.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Masuk atau Daftar"
          testID="nav-cta"
          onPress={onAccount}
          style={{
            backgroundColor: v2.ink,
            borderWidth: 2,
            borderColor: v2.ink,
            paddingVertical: 8,
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{ color: v2.ground }}
            className="text-xs font-v2 font-bold uppercase"
          >
            Masuk / Daftar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
