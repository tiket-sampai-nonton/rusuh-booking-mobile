/**
 * MiniNav — 1:1 of the prototype transactional `.mini-nav` (event/waiting/
 * checkout/payment/success/expired share it). A sticky dark-glass bar: brand
 * (ember→red mark + "Rusuh Tiket") on the left, a muted back link on the right,
 * over `rgba(10,10,12,.7)` with a hairline bottom border.
 *
 * `onBack` is optional — when omitted the back link is still shown but inert
 * (some screens, e.g. waiting, hide it; pass `showBack={false}` there).
 */
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { neutral } from "@presentation/theme";

export interface MiniNavProps {
  /** Right-side label, e.g. "← Beranda". Default "← Beranda". */
  readonly backLabel?: string;
  readonly onBack?: () => void;
  readonly showBack?: boolean;
  readonly testID?: string;
}

export function MiniNav({
  backLabel = "← Beranda",
  onBack,
  showBack = true,
  testID,
}: MiniNavProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      // position:sticky top:0 — in RN this bar sits above the scroll content;
      // its top padding clears the device safe area (notch / status bar).
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingTop: insets.top + 14,
        paddingBottom: 14,
        paddingHorizontal: 20,
        backgroundColor: "rgba(10,10,12,0.7)",
        borderBottomWidth: 1,
        borderBottomColor: neutral.lineDark,
      }}
      testID={testID ?? "mini-nav"}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
        <View
          style={{ width: 22, height: 22, borderRadius: 7, overflow: "hidden" }}
          className="items-center justify-center bg-brand"
        >
          <Text style={{ fontSize: 12, color: "#fff" }} accessibilityElementsHidden>
            ▶
          </Text>
        </View>
        <Text
          style={{ fontSize: 15, letterSpacing: -0.3 }}
          className="font-extrabold text-white"
        >
          Rusuh Tiket
        </Text>
      </View>
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          onPress={onBack}
          disabled={!onBack}
          testID="mini-nav-back"
        >
          <Text style={{ fontSize: 13 }} className="font-semibold text-white/60">
            {backLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
