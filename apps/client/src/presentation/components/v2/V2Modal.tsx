/**
 * RBT-096 — V2Modal (Re-implementation)
 *
 * MASTER-SPEC §2.4:
 * OVERLAY:
 * - background: rgba(0,0,0,0.8)
 * - backdropFilter: blur(4px)
 *
 * MODAL:
 * - background: #fff
 * - border: 2px solid #000
 * - padding: 48px
 * - maxWidth: 400
 *
 * ENTRANCE: opacity 0→1, translateY 20→0, scale 0.95→1, 0.4s
 */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Modal, Platform, Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { v2Colors, v2Borders, v2Modal, v2Easing, interFonts } from '@presentation/theme';

const EASE = Easing.bezier(...v2Easing.primary);
const ENTRANCE_DURATION = 400; // 0.4s

export interface V2ModalProps {
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

export function V2Modal({
  visible,
  onClose,
  children,
  title,
  testID,
}: V2ModalProps) {
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable
        testID={testID ? `${testID}-backdrop` : 'v2-modal-backdrop'}
        accessibilityLabel="Tutup dialog"
        onPress={onClose}
        style={[styles.backdrop, Platform.OS !== 'web' && { justifyContent: 'flex-end', padding: 0 }]}
      >
        {/* Modal card - stop propagation to prevent close on card tap */}
        <Pressable
          testID={testID ?? 'v2-modal-card'}
          accessibilityViewIsModal
          accessibilityRole={Platform.OS === 'web' ? ('dialog' as 'none') : undefined}
          onPress={(e) => e.stopPropagation()}
          style={[styles.cardWrapper, Platform.OS !== 'web' && { maxWidth: '100%' }]}
        >
          <Animated.View style={[styles.card, Platform.OS !== 'web' && { padding: 24, borderBottomWidth: 0 }, cardStyle]}>
            {/* Title */}
            {title && (
              <Text
                accessibilityRole="header"
                style={styles.title}
              >
                {title}
              </Text>
            )}

            {/* Content */}
            <View>{children}</View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    // Note: backdropFilter blur not available in RN, handled by semi-transparent bg
  },
  cardWrapper: {
    width: '100%',
    maxWidth: v2Modal.maxWidth,
  },
  card: {
    backgroundColor: v2Colors.ground,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    padding: v2Modal.padding,
  },
  title: {
    color: v2Colors.ink,
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.02 * 20, // --tracking-tight
    marginBottom: 12,
    fontFamily: interFonts.bold,
  },
});

export default V2Modal;
