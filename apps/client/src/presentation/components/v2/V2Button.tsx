/**
 * V2Button — Brutalist Mono button with an ink-spread fill on press (RBT-087).
 *
 * Prototype `.btn` (01-home): a hard 2px-bordered button whose fill slides in
 * from an edge on hover/press, inverting fg/bg. On native there is no hover, so
 * the fill animates on press-in/out; on web it also responds to pointer hover.
 * Reanimated-driven; honors reduced-motion (instant fill, no slide).
 *
 * Variants: `primary` (ink bg → ground fill) and `ghost` (ground bg → ink fill),
 * plus `danger` (accent bg). Presentation-only; no domain/infra import.
 */
import { useCallback } from "react";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { v2, v2Motion } from "@presentation/theme";

const EASE = Easing.bezier(...v2Motion.easeBezier);
const DURATION = 400;

export type V2ButtonVariant = "primary" | "ghost" | "danger";

export interface V2ButtonProps {
  readonly label: string;
  readonly onPress?: () => void;
  readonly variant?: V2ButtonVariant;
  readonly disabled?: boolean;
  readonly large?: boolean;
  readonly testID?: string;
  /** Trailing glyph (e.g. "→"); optional. */
  readonly trailing?: ReactNode;
}

/** fg/bg per variant: [base bg, base fg, fill color, filled fg]. */
function palette(variant: V2ButtonVariant): {
  bg: string;
  fg: string;
  fill: string;
  filledFg: string;
} {
  switch (variant) {
    case "ghost":
      return { bg: v2.ground, fg: v2.ink, fill: v2.ink, filledFg: v2.ground };
    case "danger":
      return { bg: v2.accent, fg: v2.ground, fill: v2.ink, filledFg: v2.ground };
    case "primary":
    default:
      return { bg: v2.ink, fg: v2.ground, fill: v2.ground, filledFg: v2.ink };
  }
}

export function V2Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  large = false,
  testID,
  trailing,
}: V2ButtonProps) {
  const reduced = useReducedMotion();
  const p = useSharedValue(0); // 0 = base, 1 = filled
  const pal = palette(variant);

  const setFilled = useCallback(
    (on: boolean) => {
      if (disabled) return;
      if (reduced) {
        p.value = on ? 1 : 0;
        return;
      }
      p.value = withTiming(on ? 1 : 0, { duration: DURATION, easing: EASE });
    },
    [disabled, reduced, p],
  );

  // The sliding fill layer.
  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: `${(1 - p.value) * 101}%` as `${number}%` }],
  }));

  // Label color crossfades between base fg and filled fg.
  const labelStyle = useAnimatedStyle(() => ({
    color: p.value > 0.5 ? pal.filledFg : pal.fg,
  }));

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setFilled(true)}
      onPressOut={() => setFilled(false)}
      // Pressable accepts hover handlers on every platform; they only fire on
      // web (hover), so no Platform branch is needed.
      onHoverIn={() => setFilled(true)}
      onHoverOut={() => setFilled(false)}
      style={{
        borderWidth: 2,
        borderColor: v2.ink,
        backgroundColor: pal.bg,
        paddingVertical: large ? 16 : 10,
        paddingHorizontal: large ? 32 : 20,
        overflow: "hidden",
        opacity: disabled ? 0.5 : 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: pal.fill },
          fillStyle,
        ]}
      />
      <Animated.Text
        style={labelStyle}
        className="text-sm font-v2 font-bold uppercase"
        accessibilityElementsHidden={false}
      >
        {label}
      </Animated.Text>
      {trailing != null ? (
        <View pointerEvents="none">
          {typeof trailing === "string" ? (
            <Text style={{ color: pal.fg }} className="text-sm font-v2 font-bold">
              {trailing}
            </Text>
          ) : (
            trailing
          )}
        </View>
      ) : null}
    </Pressable>
  );
}
