/**
 * CheckoutScreen — buyer data + ticket items + idempotent hold (RBT-050…054).
 *
 * Matches prototype `detail.html` (the checkout page): buyer NIK + email, a
 * dynamic ticket list (category + attendee name + NIK) with a single-use
 * "Gunakan NIK pembeli" checkbox (D9.1), a server-authoritative hold timer
 * (RBT-050), and "Lanjut Bayar" → idempotent hold → payment. Login is optional
 * (D8.5): the NIK consent note is shown inline here.
 *
 * NIK is masked on display and never logged (SECURITY/D7.1). Category options
 * are a default set until the BE checkout-category contract (O1) lands.
 */
import { useRouter, type Href } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  effectiveCap,
  isCheckoutReady,
  isValidNik,
  type TicketRow,
} from "@domain/rules/checkout";
import { formatCountdown } from "@domain/services/date-format";
import { useCheckout } from "@presentation/hooks/useCheckout";
import { useServerCountdown } from "@presentation/hooks/useServerCountdown";
import { useServices } from "@providers/service-context";

/** Default ticket categories (O1 gap — real set arrives from BE checkout page). */
const CATEGORIES = [
  { id: "REG", label: "Reguler" },
  { id: "VIP", label: "VIP" },
] as const;

function emptyRow(): TicketRow {
  return {
    categoryId: CATEGORIES[0].id,
    attendeeName: "",
    attendeeNik: "",
    useBuyerNik: false,
  };
}

export interface CheckoutScreenProps {
  readonly sessionId: string;
}

export function CheckoutScreen({ sessionId }: CheckoutScreenProps) {
  const router = useRouter();
  const { serverClock } = useServices();
  const { session, isLoading, hold } = useCheckout();

  const [buyerNik, setBuyerNik] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [rows, setRows] = useState<TicketRow[]>([emptyRow()]);

  const cap = effectiveCap(session?.maxSelectable);

  const { remainingMs, expired } = useServerCountdown({
    clock: serverClock,
    expiresAtIso: session?.expiresAt,
    serverTimeIso: session?.serverTime,
    onExpire: () => router.replace(`/expired/${sessionId}` as Href),
  });

  const ready = useMemo(
    () =>
      isCheckoutReady({
        buyerNik,
        buyerEmail,
        rows,
        maxSelectable: cap,
      }),
    [buyerNik, buyerEmail, rows, cap],
  );

  const addRow = (): void => {
    if (rows.length >= cap) return;
    setRows((r) => [...r, emptyRow()]);
  };
  const removeRow = (i: number): void => {
    setRows((r) => (r.length <= 1 ? r : r.filter((_, idx) => idx !== i)));
  };
  const patchRow = (i: number, patch: Partial<TicketRow>): void => {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  };
  // Single-use buyer NIK: turning it on for one row turns it off for the others.
  const setUseBuyer = (i: number, on: boolean): void => {
    setRows((r) =>
      r.map((row, idx) => ({
        ...row,
        useBuyerNik: idx === i ? on : on ? false : row.useBuyerNik,
      })),
    );
  };

  const onSubmit = (): void => {
    if (!ready || !session) return;
    hold.mutate(
      { sessionId: session.sessionId, rows, buyerNik },
      {
        onSuccess: (booking) => {
          router.push(`/payment/${booking.bookingId}` as Href);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background" testID="checkout-loading">
        <Text className="text-sm text-muted-foreground">Memulihkan sesi…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Server-authoritative hold timer */}
      <View className="flex-row items-center justify-between border-b border-line bg-card px-5 pb-3 pt-12">
        <Text className="text-sm font-bold text-foreground" accessibilityRole="header">
          Checkout
        </Text>
        <Text
          className={`text-sm font-extrabold ${expired ? "text-error" : "text-brand"}`}
          accessibilityLabel={`Sisa waktu ${formatCountdown(remainingMs)}`}
          accessibilityLiveRegion="polite"
          testID="checkout-timer"
        >
          ⏱ {formatCountdown(remainingMs)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} testID="checkout-scroll">
        <Section title="Data Pembeli">
          <Field
            label="NIK Pembeli (16 digit)"
            value={buyerNik}
            onChangeText={(t) => setBuyerNik(t.replace(/\D/g, "").slice(0, 16))}
            placeholder="16 digit KTP pembeli"
            keyboardType="number-pad"
            testID="buyer-nik"
            invalid={buyerNik.length > 0 && !isValidNik(buyerNik)}
          />
          <Field
            label="Email"
            value={buyerEmail}
            onChangeText={setBuyerEmail}
            placeholder="kamu@email.com"
            keyboardType="email-address"
            testID="buyer-email"
          />
          <Text className="mt-2 text-2xs text-muted-foreground">
            NIK pembeli dipakai untuk batas 3 tiket/NIK & divalidasi server.
            Dengan lanjut, kamu setuju NIK & email diproses untuk pemesanan ini.
          </Text>
        </Section>

        <Section title="Tiket">
          {rows.map((row, i) => (
            <TicketItem
              key={i}
              index={i}
              row={row}
              canRemove={rows.length > 1}
              onRemove={() => removeRow(i)}
              onPatch={(p) => patchRow(i, p)}
              onUseBuyer={(on) => setUseBuyer(i, on)}
            />
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tambah tiket"
            accessibilityState={{ disabled: rows.length >= cap }}
            disabled={rows.length >= cap}
            onPress={addRow}
            testID="add-ticket"
            className={`mt-3 items-center rounded-md border border-dashed border-line py-3 ${rows.length >= cap ? "opacity-50" : ""}`}
          >
            <Text className="text-sm font-bold text-foreground">＋ Tambah tiket</Text>
          </Pressable>
          <Text className="mt-2 text-2xs text-muted-foreground">
            Maksimal {cap} tiket per NIK, divalidasi server. Tiap tiket butuh 1 NIK penonton.
          </Text>
        </Section>
      </ScrollView>

      <View className="border-t border-line bg-card p-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lanjut Bayar"
          accessibilityState={{ disabled: !ready || hold.isPending || expired }}
          disabled={!ready || hold.isPending || expired}
          onPress={onSubmit}
          testID="checkout-submit"
          className={`items-center rounded-pill py-4 ${ready && !expired ? "bg-brand" : "bg-muted"}`}
        >
          <Text className="text-md font-bold text-white">
            {hold.isPending ? "Memproses…" : expired ? "Waktu habis" : "Lanjut Bayar →"}
          </Text>
        </Pressable>
        {hold.isError ? (
          <Text className="mt-2 text-center text-xs text-error" accessibilityLiveRegion="polite">
            {hold.error?.message || "Gagal memproses pemesanan. Coba lagi."}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function Section({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return (
    <View className="mt-5">
      <Text className="text-2xs font-bold uppercase tracking-tag text-muted-foreground" accessibilityRole="header">
        {title}
      </Text>
      <View className="mt-2">{children}</View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  testID,
  invalid = false,
  editable = true,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (t: string) => void;
  readonly placeholder?: string;
  readonly keyboardType?: "number-pad" | "email-address" | "default";
  readonly testID?: string;
  readonly invalid?: boolean;
  readonly editable?: boolean;
}) {
  return (
    <View className="mt-3">
      <Text className="mb-1 text-xs font-bold text-foreground">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        editable={editable}
        testID={testID}
        className={`rounded-md border px-3.5 py-3 text-md text-foreground ${invalid ? "border-error" : "border-line"}`}
      />
      {invalid ? (
        <Text className="mt-1 text-2xs text-error">NIK harus 16 digit.</Text>
      ) : null}
    </View>
  );
}

function TicketItem({
  index,
  row,
  canRemove,
  onRemove,
  onPatch,
  onUseBuyer,
}: {
  readonly index: number;
  readonly row: TicketRow;
  readonly canRemove: boolean;
  readonly onRemove: () => void;
  readonly onPatch: (p: Partial<TicketRow>) => void;
  readonly onUseBuyer: (on: boolean) => void;
}) {
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
