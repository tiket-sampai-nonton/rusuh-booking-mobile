/**
 * ExpiredScreen — expired / failed recovery (RBT-064, E7/E6).
 *
 * Shown when a booking hold or payment deadline passes, or a payment fails. The
 * `reason` query param drives the copy (payment / payment-failed / session);
 * the recovery CTA re-queues from the start. Clears the stale session state
 * (D7.4) so the user restarts cleanly. Matches prototype `expired.html`.
 */
import { useRouter, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useSessionStore } from "@presentation/stores/session-store";

export type ExpiredReason = "payment" | "payment-failed" | "session" | string;

export interface ExpiredScreenProps {
  readonly resourceId: string;
  readonly reason?: ExpiredReason;
}

function copyFor(reason: ExpiredReason | undefined): { title: string; body: string } {
  switch (reason) {
    case "payment":
      return {
        title: "Waktu Pembayaran Habis",
        body: "Batas waktu pembayaran terlewati dan hold tiketmu dilepas. Kamu perlu mengantre lagi untuk memesan.",
      };
    case "payment-failed":
      return {
        title: "Pembayaran Gagal",
        body: "Pembayaran tidak berhasil. Hold tiket telah dilepas — silakan antre kembali untuk mencoba lagi.",
      };
    case "session":
    default:
      return {
        title: "Sesi Berakhir",
        body: "Sesi pemesananmu telah berakhir. Mulai lagi dari awal untuk mengamankan tiket.",
      };
  }
}

export function ExpiredScreen({ resourceId, reason }: ExpiredScreenProps) {
  const router = useRouter();
  const eventId = useSessionStore((s) => s.eventId);
  const reset = useSessionStore((s) => s.reset);
  const { title, body } = copyFor(reason);

  const onRequeue = (): void => {
    const target = eventId; // re-queue to the same event when known
    reset();
    router.replace((target ? `/events/${target}` : "/") as Href);
  };

  return (
    <View className="flex-1 items-center justify-center bg-background p-6" testID="expired-screen">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-error">
        <Text className="text-3xl text-white" accessibilityElementsHidden>
          ⏱
        </Text>
      </View>
      <Text
        className="mt-4 text-2xl font-extrabold text-foreground"
        accessibilityRole="header"
        accessibilityLiveRegion="polite"
      >
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm text-muted-foreground">{body}</Text>
      <Text className="mt-1 text-2xs text-muted-foreground">Ref: {resourceId}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={eventId ? "Antre lagi" : "Ke Beranda"}
        onPress={onRequeue}
        testID="expired-requeue"
        className="mt-7.5 items-center rounded-pill bg-brand px-8 py-4"
      >
        <Text className="text-md font-bold text-white">
          {eventId ? "Antre Lagi →" : "Ke Beranda →"}
        </Text>
      </Pressable>
    </View>
  );
}
