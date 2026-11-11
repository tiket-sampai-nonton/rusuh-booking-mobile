/**
 * RBT-096 — Modal (Re-implementation)
 *
 * MASTER-SPEC §2.4:
 * OVERLAY:
 * - background: shared overlay token with alpha
 * - backdropFilter: blur(4px)
 *
 * MODAL:
 * - background and border use the shared ground and ink tokens
 * - padding: 48px
 * - maxWidth: 400
 *
 * ENTRANCE: opacity 0→1, translateY 20→0, scale 0.95→1, 0.4s
 */
import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  Modal as NativeModal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { designEasing } from "@presentation/theme";
import { NativeStatusBarBackdrop } from "@presentation/components/NativeStatusBarBackdrop";
import { styles } from "./style";
import {
  styleForModalPressable0,
  styleForModalPressable1,
  styleForModalAnimatedView2,
} from "./style";

const EASE = Easing.bezier(...designEasing.primary);
const ENTRANCE_DURATION = 400; // 0.4s

export interface ModalProps {
  /** Whether the modal is visible */
  readonly visible: boolean;
  /** Close handler (backdrop tap, escape key, back button) */
  readonly onClose: () => void;
  /** Modal content */
  readonly children: ReactNode;
  /** Optional title in brutalist header style */
  readonly title?: string;
  /** Test ID */
  readonly testID?: string;
}

export function Modal({
  visible,
  onClose,
  children,
  title,
  testID,
}: ModalProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      progress.value = 0;
      return;
    }

    if (reducedMotion) {
      progress.value = 1;
      return;
    }

    progress.value = withTiming(1, {
      duration: ENTRANCE_DURATION,
      easing: EASE,
    });
  }, [visible, reducedMotion, progress]);

  // Card entrance animation: opacity, translateY, scale
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 20 },
      { scale: 0.95 + progress.value * 0.05 },
    ],
  }));

  return (
    <NativeModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <NativeStatusBarBackdrop />
      {/* Backdrop */}
      <Pressable
        testID={testID ? `${testID}-backdrop` : "v2-modal-backdrop"}
        accessibilityLabel="Tutup dialog"
        onPress={onClose}
        style={[
          styles.backdrop,
          Platform.OS !== "web" && styleForModalPressable0(),
        ]}
      >
        {/* Modal card - stop propagation to prevent close on card tap */}
        <Pressable
          testID={testID ?? "v2-modal-card"}
          accessibilityViewIsModal
          accessibilityRole={
            Platform.OS === "web" ? ("dialog" as "none") : undefined
          }
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.cardWrapper,
            Platform.OS !== "web" && styleForModalPressable1(),
          ]}
        >
          <Animated.View
            style={[
              styles.card,
              Platform.OS !== "web" && styleForModalAnimatedView2(),
              cardStyle,
            ]}
          >
            {/* Title */}
            {title && (
              <Text accessibilityRole="header" style={styles.title}>
                {title}
              </Text>
            )}

            {/* Content */}
            <View>{children}</View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </NativeModal>
  );
}

export default Modal;
