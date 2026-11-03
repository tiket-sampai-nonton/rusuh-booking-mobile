/**
 * V2Modal — Brutalist Mono modal shell (RBT-087).
 *
 * Prototype `.modal-overlay` + `.modal`: a dimmed backdrop (tap-to-close) with
 * a hard 2px-bordered white card that scales/fades in. Built on RN `Modal` so
 * it layers correctly on native and web, with a backdrop press + Escape/back
 * (onRequestClose) close. Reanimated card entrance; honors reduced-motion.
 *
 * Presentation-only; the caller owns the content and open/close state.
 */
import { useEffect } from "react";
import type { ReactNode } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { v2, v2Motion } from "@presentation/theme";

const EASE = Easing.bezier(...v2Motion.easeBezier);

export interface V2ModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
  /** Optional title rendered in a brutalist header. */
  readonly title?: string;
  readonly testID?: string;
}

export function V2Modal({ visible, onClose, children, title, testID }: V2ModalProps) {
  const reduced = useReducedMotion();
  const p = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      p.value = 0;
      return;
    }
    p.value = reduced ? 1 : withTiming(1, { duration: 400, easing: EASE });
  }, [visible, reduced, p]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * 20 }, { scale: 0.95 + p.value * 0.05 }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        testID={testID ? `${testID}-backdrop` : "v2-modal-backdrop"}
        accessibilityLabel="Tutup dialog"
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.8)",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Pressable
          testID={testID ?? "v2-modal-card"}
          accessibilityViewIsModal
          accessibilityRole={Platform.OS === "web" ? "none" : undefined}
          onPress={(e) => e.stopPropagation()}
          style={{ width: "100%", maxWidth: 420 }}
        >
          <Animated.View
            style={[
              cardStyle,
              { backgroundColor: v2.ground, borderWidth: 2, borderColor: v2.ink, padding: 24 },
            ]}
          >
            {title ? (
              <Text
                accessibilityRole="header"
                style={{ color: v2.ink, marginBottom: 12 }}
                className="text-xl font-v2 font-black uppercase"
              >
                {title}
              </Text>
            ) : null}
            <View>{children}</View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
