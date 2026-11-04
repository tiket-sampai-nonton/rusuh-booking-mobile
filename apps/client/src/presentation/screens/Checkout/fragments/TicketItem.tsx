/**
 * RBT-092 — V2 Brutalist Mono Ticket Item
 *
 * PROTOTYPE 03-checkout.html ticket row styling:
 * - 2px solid black border, no rounded corners
 * - Category pills with filled/outlined states
 * - Uppercase labels
 */
import { Pressable, Switch, Text, View } from "react-native";

import { isValidNik } from "@domain/rules/checkout";
import { v2Colors, interFonts } from "@presentation/theme";

import { CATEGORIES } from "../categories";
import { Field } from "./common";
import type { TicketItemProps } from "../interface";

const STATUS_TEXT: Record<string, { label: string; color: string }> = {
  checking: { label: "Mengecek ketersediaan NIK…", color: v2Colors.gray },
  available: { label: "NIK tersedia", color: v2Colors.success },
  blocked: { label: "NIK sudah terdaftar untuk event ini.", color: "#ff0000" },
  warning: { label: "Batas pengecekan tercapai — lanjut, server memvalidasi.", color: v2Colors.warning },
};

export function TicketItem({ index, row, canRemove, onRemove, onPatch, onUseBuyer, status = "idle" }: TicketItemProps) {
  const statusInfo = STATUS_TEXT[status];
  return (
    <View
      style={{
        marginTop: 16,
        borderWidth: 2,
        borderColor: v2Colors.ink,
        backgroundColor: v2Colors.ground,
        padding: 20,
      }}
      testID={`ticket-row-${index}`}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: interFonts.bold,
            color: v2Colors.ink,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Tiket #{index + 1}
        </Text>
        {canRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Hapus tiket ${index + 1}`}
            onPress={onRemove}
            testID={`remove-ticket-${index}`}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: interFonts.bold,
                color: "#ff0000",
                textTransform: "uppercase",
              }}
            >
              Hapus
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Text
        style={{
          marginTop: 16,
          fontSize: 10,
          fontFamily: interFonts.bold,
          color: v2Colors.gray,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Kategori
      </Text>
      <View style={{ marginTop: 8, flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {CATEGORIES.map((c) => {
          const selected = row.categoryId === c.id;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityLabel={`Kategori ${c.label}`}
              accessibilityState={{ selected }}
              onPress={() => onPatch({ categoryId: c.id })}
              testID={`cat-${index}-${c.id}`}
              style={{
                borderWidth: 2,
                borderColor: v2Colors.ink,
                backgroundColor: selected ? v2Colors.ink : v2Colors.ground,
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: interFonts.bold,
                  color: selected ? v2Colors.ground : v2Colors.ink,
                  textTransform: "uppercase",
                }}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Field
        label="Nama Penonton"
        value={row.useBuyerNik ? "Pembeli" : row.attendeeName}
        onChangeText={(t) => onPatch({ attendeeName: t })}
        placeholder="Nama sesuai KTP"
        editable={!row.useBuyerNik}
        testID={`attendee-name-${index}`}
      />
      <Field
        label="NIK Penonton (16 digit)"
        value={row.useBuyerNik ? "" : row.attendeeNik}
        onChangeText={(t) => onPatch({ attendeeNik: t.replace(/\D/g, "").slice(0, 16) })}
        placeholder="16 digit KTP penonton"
        keyboardType="number-pad"
        editable={!row.useBuyerNik}
        invalid={!row.useBuyerNik && row.attendeeNik.length > 0 && !isValidNik(row.attendeeNik)}
        testID={`attendee-nik-${index}`}
      />

      {statusInfo ? (
        <Text
          style={{
            marginTop: 8,
            fontSize: 11,
            fontFamily: interFonts.medium,
            color: statusInfo.color,
          }}
          accessibilityLiveRegion="polite"
          testID={`attendee-status-${index}`}
        >
          {statusInfo.label}
        </Text>
      ) : null}

      <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text
          style={{
            flex: 1,
            paddingRight: 12,
            fontSize: 13,
            fontFamily: interFonts.regular,
            color: v2Colors.ink,
          }}
        >
          Gunakan NIK pembeli (pembeli ikut nonton)
        </Text>
        <Switch
          accessibilityLabel={`Gunakan NIK pembeli untuk tiket ${index + 1}`}
          value={row.useBuyerNik}
          onValueChange={onUseBuyer}
          trackColor={{ false: v2Colors.field, true: v2Colors.ink }} // Use field per Design Palette Guide
          thumbColor={v2Colors.ground}
          testID={`use-buyer-${index}`}
        />
      </View>
    </View>
  );
}
