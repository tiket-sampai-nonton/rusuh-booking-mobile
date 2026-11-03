/**
 * V2Toast — Brutalist Mono toast (RBT-087).
 *
 * Prototype `.toast`: a hard-edged ink/green/red pill that slides in from the
 * edge, holds ~3s, slides out. Exposed as a `useV2Toast()` hook returning
 * `{ show, toast }` — render `toast` once near the root and call `show(msg,
 * type)` from anywhere in that subtree. Reanimated-driven; honors reduced-
 * motion (instant show/hide, no slide).
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { v2, v2Motion } from "@presentation/theme";

const EASE = Easing.bezier(...v2Motion.expoBezier);

export type V2ToastType = "info" | "success" | "error";

function bgFor(type: V2ToastType): string {
  if (type === "success") return v2.success;
  if (type === "error") return v2.accent;
  return v2.ink;
}

export interface V2ToastController {
  show: (message: string, type?: V2ToastType) => void;
}

/** Standalone toast host + controller (no context needed for single use). */
export function useV2Toast(): { show: V2ToastController["show"]; toast: ReactNode } {
  const reduced = useReducedMotion();
  const [message, setMessage] = useState("");
  const [type, setType] = useState<V2ToastType>("info");
  const p = useSharedValue(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback<V2ToastController["show"]>(
    (msg, t = "info") => {
      setMessage(msg);
      setType(t);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (reduced) {
        p.value = 1;
      } else {
        p.value = withTiming(1, { duration: 400, easing: EASE });
      }
      hideTimer.current = setTimeout(() => {
        p.value = reduced ? 0 : withTiming(0, { duration: 400, easing: EASE });
      }, 3000);
    },
    [reduced, p],
  );

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * 80 }],
  }));

  const toast = useMemo(
    () => (
      <Animated.View
        testID="v2-toast"
        accessibilityRole="alert"
        pointerEvents="none"
        style={[style, { backgroundColor: bgFor(type), paddingVertical: 16, paddingHorizontal: 32 }]}
      >
        <Text style={{ color: v2.ground }} className="text-sm font-v2 font-bold">
          {message}
        </Text>
      </Animated.View>
    ),
    [style, type, message],
  );

  return { show, toast };
}

/** Optional context form when many descendants need `show`. */
const V2ToastContext = createContext<V2ToastController | null>(null);

export function V2ToastProvider({ children }: { readonly children: ReactNode }) {
  const { show, toast } = useV2Toast();
  const value = useMemo(() => ({ show }), [show]);
  return (
    <V2ToastContext.Provider value={value}>
      {children}
      {toast}
    </V2ToastContext.Provider>
  );
}

export function useV2ToastContext(): V2ToastController {
  const ctx = useContext(V2ToastContext);
  if (!ctx) throw new Error("useV2ToastContext must be used within a V2ToastProvider");
  return ctx;
}
