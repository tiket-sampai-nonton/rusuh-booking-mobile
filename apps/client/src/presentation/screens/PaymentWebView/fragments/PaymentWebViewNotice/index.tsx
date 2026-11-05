import { Text, View } from "react-native";

export type PaymentWebViewNoticeVariant = "web" | "error" | "loading";

const NOTICE_COPY: Readonly<Record<PaymentWebViewNoticeVariant, { testID: string; text: string; textClassName: string }>> = {
  web: {
    testID: "paywv-web",
    text: "Pembayaran dibuka langsung di halaman ini (tanpa WebView di web).",
    textClassName: "text-muted-foreground",
  },
  error: {
    testID: "paywv-error",
    text: "Gagal membuka halaman pembayaran. Coba lagi.",
    textClassName: "text-error",
  },
  loading: {
    testID: "paywv-loading",
    text: "Membuka pembayaran…",
    textClassName: "text-muted-foreground",
  },
};

export function PaymentWebViewNotice({ variant }: { readonly variant: PaymentWebViewNoticeVariant }) {
  const copy = NOTICE_COPY[variant];
  const textClass = variant === "loading" ? "text-sm" : "text-center text-sm";

  return (
    <View
      className={`flex-1 items-center justify-center bg-background p-6 ${variant === "loading" ? "p-0" : ""}`}
      testID={copy.testID}
    >
      <Text className={`${textClass} ${copy.textClassName}`}>{copy.text}</Text>
    </View>
  );
}
