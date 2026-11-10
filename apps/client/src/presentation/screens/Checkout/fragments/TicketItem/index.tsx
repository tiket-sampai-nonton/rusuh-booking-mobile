/**
 * RBT-092 —  Brutalist Mono Ticket Item
 *
 * PROTOTYPE 03-checkout.html ticket row styling:
 * - 2px solid black border, no rounded corners
 * - Category pills with filled/outlined states
 * - Uppercase labels
 */
import { Pressable, Switch, Text, View } from "react-native";

import { isValidNik } from "@domain/rules/checkout";
import { designColors } from "@presentation/theme";
import { minorToIDR } from "@domain/services/money";

import { Field } from ".././common";
import type { TicketItemProps } from "../../interface";
import { componentStyles } from "./style";
import {
  styleForTicketItemPressable0,
  styleForTicketItemText1,
  styleForTicketItemText2,
} from "./style";

const STATUS_TEXT: Record<string, { label: string; color: string }> = {
  checking: { label: "Mengecek ketersediaan NIK…", color: designColors.gray },
  available: { label: "NIK tersedia", color: designColors.success },
  blocked: {
    label: "NIK sudah terdaftar untuk event ini.",
    color: designColors.danger,
  },
  warning: {
    label: "Batas pengecekan tercapai — lanjut, server memvalidasi.",
    color: designColors.warning,
  },
};

export function TicketItem({
  index,
  row,
  canRemove,
  onRemove,
  onPatch,
  onUseBuyer,
  status = "idle",
  categories,
  buyerName = "",
  buyerNik = "",
  categoryError,
  attendeeNameError,
  attendeeNikError,
}: TicketItemProps) {
  const statusInfo = STATUS_TEXT[status];
  return (
    <View
      style={componentStyles.elementMarginTop0}
      testID={`ticket-row-${index}`}
    >
      <View style={componentStyles.elementFlexDirection1}>
        <Text style={componentStyles.elementFontSize2}>Tiket #{index + 1}</Text>
        {canRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Hapus tiket ${index + 1}`}
            onPress={onRemove}
            testID={`remove-ticket-${index}`}
          >
            <Text style={componentStyles.elementFontSize3}>Hapus</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={componentStyles.elementMarginTop4}>Kategori</Text>
      <View style={componentStyles.elementMarginTop5}>
        {categories.map((category) => {
          const selected = row.categoryId === category.categoryId;
          return (
            <Pressable
              key={category.categoryId}
              accessibilityRole="button"
              accessibilityLabel={`Kategori ${category.name}, ${minorToIDR(category.priceMinor)}`}
              accessibilityState={{ selected }}
              onPress={() => onPatch({ categoryId: category.categoryId })}
              testID={`cat-${index}-${category.code}`}
              style={styleForTicketItemPressable0(selected)}
            >
              <Text style={styleForTicketItemText1(selected)}>
                {category.name} · {minorToIDR(category.priceMinor)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {categoryError ? (
        <Text style={componentStyles.validationError} accessibilityRole="alert">
          {categoryError}
        </Text>
      ) : null}

      <Field
        label="Nama Penonton"
        value={row.useBuyerNik ? buyerName : row.attendeeName}
        onChangeText={(t) => onPatch({ attendeeName: t })}
        placeholder="Nama sesuai KTP"
        editable={!row.useBuyerNik}
        invalid={Boolean(attendeeNameError)}
        errorMessage={attendeeNameError}
        testID={`attendee-name-${index}`}
      />
      <Field
        label="NIK Penonton (16 digit)"
        value={row.useBuyerNik ? buyerNik : row.attendeeNik}
        onChangeText={(t) =>
          onPatch({ attendeeNik: t.replace(/\D/g, "").slice(0, 16) })
        }
        placeholder="16 digit KTP penonton"
        keyboardType="number-pad"
        editable={!row.useBuyerNik}
        invalid={
          Boolean(attendeeNikError) ||
          (!row.useBuyerNik &&
            row.attendeeNik.length > 0 &&
            !isValidNik(row.attendeeNik))
        }
        errorMessage={attendeeNikError}
        testID={`attendee-nik-${index}`}
      />

      {statusInfo ? (
        <Text
          style={styleForTicketItemText2(statusInfo)}
          accessibilityLiveRegion="polite"
          testID={`attendee-status-${index}`}
        >
          {statusInfo.label}
        </Text>
      ) : null}

      <View style={componentStyles.elementMarginTop6}>
        <Text style={componentStyles.elementFlex7}>
          Gunakan data pembeli (pembeli ikut nonton)
        </Text>
        <Switch
          accessibilityLabel={`Gunakan data pembeli untuk tiket ${index + 1}`}
          value={row.useBuyerNik}
          onValueChange={onUseBuyer}
          trackColor={{ false: designColors.field, true: designColors.ink }} // Use field per Design Palette Guide
          thumbColor={designColors.ground}
          testID={`use-buyer-${index}`}
        />
      </View>
    </View>
  );
}
