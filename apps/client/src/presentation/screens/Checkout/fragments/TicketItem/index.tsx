/**
 * RBT-092 —  Brutalist Mono Ticket Item
 *
 * PROTOTYPE 03-checkout.html ticket row styling:
 * - 2px solid black border, no rounded corners
 * - Category pills with filled/outlined states
 * - Uppercase labels
 */
import { Pressable, Text, View } from "react-native";

import { normalizeNikInput } from "@domain/rules/checkout";
import { designColors } from "@presentation/theme";
import { minorToIDR } from "@domain/services/money";

import { Field } from ".././common";
import type { TicketItemProps } from "../../interface";
import {
  componentStyles,
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
  showBuyerDataControl,
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
          const soldOut = category.available <= 0;
          return (
            <Pressable
              key={category.categoryId}
              accessibilityRole="button"
              accessibilityLabel={`Kategori ${category.name}, ${minorToIDR(category.priceMinor)}${soldOut ? ", habis" : ""}`}
              accessibilityState={{ selected, disabled: soldOut }}
              disabled={soldOut}
              onPress={() => onPatch({ categoryId: category.categoryId })}
              testID={`cat-${index}-${category.code}`}
              style={[
                styleForTicketItemPressable0(selected),
                soldOut && { opacity: 0.45 },
              ]}
            >
              <Text style={styleForTicketItemText1(selected)}>
                {category.name} · {minorToIDR(category.priceMinor)}
                {soldOut ? " · Habis" : ""}
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
        onChangeText={(t) => onPatch({ attendeeNik: normalizeNikInput(t) })}
        placeholder="16 digit KTP penonton"
        keyboardType="number-pad"
        editable={!row.useBuyerNik}
        invalid={Boolean(attendeeNikError)}
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

      {showBuyerDataControl ? (
        <View
          style={componentStyles.buyerDataControl}
          testID={`buyer-data-control-${index}`}
        >
          <Text style={componentStyles.elementFlex7}>
            Gunakan data pembeli (pembeli ikut nonton)
          </Text>
          <Pressable
            accessibilityLabel="Gunakan data pembeli untuk tiket pertama"
            accessibilityRole="switch"
            accessibilityState={{ checked: row.useBuyerNik }}
            onPress={() => onUseBuyer(!row.useBuyerNik)}
            hitSlop={8}
            style={componentStyles.toggleTrack}
            testID={`use-buyer-${index}`}
          >
            <View
              style={[
                componentStyles.toggleThumb,
                row.useBuyerNik && componentStyles.toggleThumbOn,
              ]}
            />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
