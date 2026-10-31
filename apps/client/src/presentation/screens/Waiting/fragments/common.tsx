/** Shared waiting-room atoms: Eyebrow, Sub, Stat, LeaveLink. */
import { Pressable, Text, View } from "react-native";

import type { LeaveLinkProps, StatProps, SubProps } from "../interface";
import { waitingLeave, waitingStyles } from "../style";

/** Prototype `.eyebrow` — "Virtual Waiting Room". */
export function Eyebrow() {
  return (
    <Text
      className="font-semibold uppercase text-white/60"
      style={waitingStyles.eyebrow}
      accessibilityRole="header"
    >
      Virtual Waiting Room
    </Text>
  );
}

/** Prototype `.sub` muted paragraph. */
export function Sub({ children }: SubProps) {
  return (
    <Text className="mt-1.5 text-center text-sm leading-5 text-white/60" style={waitingStyles.sub}>
      {children}
    </Text>
  );
}

export function Stat({ value, label }: StatProps) {
  return (
    <View className="flex-1 items-center rounded-xl border border-white/10 bg-white/[0.04] py-3.5">
      <Text className="text-lg font-extrabold text-white">{value}</Text>
      <Text className="mt-1 text-2xs uppercase tracking-tag text-white/60" style={waitingStyles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

/** Prototype `.leave` — an underlined muted text link. */
export function LeaveLink({ label, onPress, disabled = false }: LeaveLinkProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID="waiting-leave"
      style={waitingLeave(disabled)}
    >
      <Text className="text-xs text-white/40 underline">{label}</Text>
    </Pressable>
  );
}
