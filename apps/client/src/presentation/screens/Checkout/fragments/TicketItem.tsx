/** One ticket row: category pills + attendee name/NIK + "use buyer NIK" switch. */
import { Pressable, Switch, Text, View } from "react-native";

import { isValidNik } from "@domain/rules/checkout";

import { CATEGORIES } from "../categories";
import { Field } from "./common";
import type { TicketItemProps } from "../interface";

const STATUS_TEXT: Record<string, { label: string; className: string }> = {
  checking: { label: "Mengecek ketersediaan NIK…", className: "text-muted-foreground" },
  available: { label: "NIK tersedia ✓", className: "text-ok" },
  blocked: { label: "NIK sudah terdaftar untuk event ini.", className: "text-error" },
  warning: { label: "Batas pengecekan tercapai — lanjut, server memvalidasi.", className: "text-warn" },
};

export function TicketItem({ index, row, canRemove, onRemove, onPatch, onUseBuyer, status = "idle" }: TicketItemProps) {
  const statusInfo = STATUS_TEXT[status];
  return (
    <View className="mt-3 rounded-xl border border-line p-3.5" testID={`ticket-row-${index}`}>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-foreground">Tiket #{index + 1}</Text>
        {canRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Hapus tiket ${index + 1}`}
            onPress={onRemove}
            testID={`remove-ticket-${index}`}
          >
            <Text className="text-xs font-bold text-error">Hapus</Text>
          </Pressable>
        ) : null}
      </View>

      <Text className="mt-2 text-2xs font-bold text-muted-foreground">Kategori</Text>
      <View className="mt-1 flex-row gap-2">
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.id}
            accessibilityRole="button"
            accessibilityLabel={`Kategori ${c.label}`}
            accessibilityState={{ selected: row.categoryId === c.id }}
            onPress={() => onPatch({ categoryId: c.id })}
            testID={`cat-${index}-${c.id}`}
            className={`rounded-pill border px-4 py-2 ${row.categoryId === c.id ? "border-brand bg-brand" : "border-line"}`}
          >
            <Text className={`text-xs font-bold ${row.categoryId === c.id ? "text-white" : "text-foreground"}`}>
              {c.label}
            </Text>
          </Pressable>
        ))}
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
          className={`mt-1 text-2xs ${statusInfo.className}`}
          accessibilityLiveRegion="polite"
          testID={`attendee-status-${index}`}
        >
          {statusInfo.label}
        </Text>
      ) : null}

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="flex-1 pr-2 text-xs text-foreground">
          Gunakan NIK pembeli (pembeli ikut nonton)
        </Text>
        <Switch
          accessibilityLabel={`Gunakan NIK pembeli untuk tiket ${index + 1}`}
          value={row.useBuyerNik}
          onValueChange={onUseBuyer}
          testID={`use-buyer-${index}`}
        />
      </View>
    </View>
  );
}
