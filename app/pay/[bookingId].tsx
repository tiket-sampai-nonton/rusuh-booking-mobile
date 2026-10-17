import { router, useLocalSearchParams } from "expo-router";
import { Linking } from "react-native";
import { WebView } from "react-native-webview";
import { loadConfig } from "@/lib/config";
import { isAllowedOrigin, isExternalScheme, parseBridgeMessage } from "@/features/payment/bridge";

// Payment page web dibuka di WebView (SCP-01). Token halaman (ppt) diminta ke Payment Service sebelum layar ini.
export default function PayScreen() {
  const { bookingId, ppt } = useLocalSearchParams<{ bookingId: string; ppt?: string }>();
  const { webBaseUrl } = loadConfig();
  const uri = `${webBaseUrl}/pay/${encodeURIComponent(bookingId)}?embedded=1${ppt ? `&ppt=${encodeURIComponent(ppt)}` : ""}`;

  return (
    <WebView
      source={{ uri }}
      allowFileAccess={false}
      allowUniversalAccessFromFileURLs={false}
      mixedContentMode="never"
      webviewDebuggingEnabled={__DEV__}
      onShouldStartLoadWithRequest={(req) => {
        if (isExternalScheme(req.url)) {
          void Linking.openURL(req.url);
          return false;
        }
        if (!isAllowedOrigin(req.url, webBaseUrl)) {
          void Linking.openURL(req.url);
          return false;
        }
        return true;
      }}
      onMessage={(e) => {
        if (!isAllowedOrigin(e.nativeEvent.url, webBaseUrl)) return;
        const msg = parseBridgeMessage(e.nativeEvent.data);
        if (!msg) return;
        if (msg.type === "EDIT_ORDER") router.back();
        // Hasil akhir selalu dari GET /api/v1/bookings/{bookingId}, bukan dari pesan bridge.
      }}
    />
  );
}
