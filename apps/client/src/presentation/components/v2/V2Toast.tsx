/**
 * RBT-096 — V2Toast (Re-implementation)
 *
 * MASTER-SPEC §2.5:
 * - position: fixed, bottom: 120px (above checkout bar)
 * - background: #000, color: #fff
 * - padding: 16px 32px
 * - fontWeight: 700
 *
 * success variant: background: #00aa00
 * error variant: background: #ff0000
 *
 * ENTRANCE: translateY 100→0, opacity 0→1
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import { v2Colors, v2Easing, v2ZIndex, interFonts } from '@presentation/theme';

const EASE = Easing.bezier(...v2Easing.out);
const ENTRANCE_DURATION = 400; // 0.4s
const EXIT_DURATION = 300;
const DEFAULT_DURATION = 3000; // 3s auto-dismiss

export type V2ToastVariant = 'default' | 'success' | 'error';

export interface V2ToastData {
  id: string;
  message: string;
  variant: V2ToastVariant;
  duration: number;
}

interface V2ToastContextValue {
  show: (message: string, variant?: V2ToastVariant, duration?: number) => void;
  hide: (id: string) => void;
}

const V2ToastContext = createContext<V2ToastContextValue | null>(null);

/**
 * Hook to show toasts from any component.
 */
export function useV2Toast() {
  const context = useContext(V2ToastContext);
  if (!context) {
    throw new Error('useV2Toast must be used within V2ToastProvider');
  }
  return context;
}

/**
 * Toast provider - wrap your app/screen with this.
 */
export function V2ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<V2ToastData[]>([]);

  const show = useCallback(
    (message: string, variant: V2ToastVariant = 'default', duration = DEFAULT_DURATION) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
    },
    [],
  );

  const hide = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <V2ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      {toasts.map((toast) => (
        <V2ToastItem key={toast.id} toast={toast} onDismiss={() => hide(toast.id)} />
      ))}
    </V2ToastContext.Provider>
  );
}

/**
 * Single toast item with entrance/exit animation.
 */
function V2ToastItem({
  toast,
  onDismiss,
}: {
  toast: V2ToastData;
  onDismiss: () => void;
}) {
  const progress = useSharedValue(0);

  // Get background color based on variant
  const backgroundColor = useMemo(() => {
    switch (toast.variant) {
      case 'success':
        return v2Colors.success;
      case 'error':
        return v2Colors.danger;
      default:
        return v2Colors.ink;
    }
  }, [toast.variant]);

  // Entrance + auto-dismiss animation (runs once on mount)
  useEffect(() => {
    // Start entrance animation
    progress.value = withTiming(1, { duration: ENTRANCE_DURATION, easing: EASE });

    // Auto-dismiss after duration
    if (toast.duration > 0) {
      const timeout = setTimeout(() => {
        progress.value = withTiming(
          0,
          { duration: EXIT_DURATION, easing: EASE },
          (finished) => {
            if (finished) {
              runOnJS(onDismiss)();
            }
          },
        );
      }, toast.duration);
      return () => clearTimeout(timeout);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 100 },
    ],
  }));

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        { backgroundColor },
        animatedStyle,
      ]}
    >
      <Text style={styles.message}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 120, // Above checkout bar
    left: 24,
    right: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    zIndex: v2ZIndex.toast,
    alignItems: 'center',
  },
  message: {
    color: v2Colors.ground,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: interFonts.medium,
  },
});

