/**
 * PillButton — the prototype's primary CTA pill.
 *
 * `variant="primary"` = brand-red filled pill (transactional CTAs). `"light"` =
 * white pill with ink text + a red circular arrow "pin" (the hero/booking CTA
 * in index.html / event.html). `"ghost"` = outlined. Disabled dims. Fully
 * accessible (role/label/state).
 */
import { Pressable, Text, View } from "react-native";

export type PillVariant = "primary" | "light" | "ghost";

export interface PillButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: PillVariant;
  readonly disabled?: boolean;
  readonly busy?: boolean;
  readonly testID?: string;
  /** Show the red arrow pin (light variant only). */
  readonly pin?: boolean;
}

export function PillButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  busy = false,
  testID,
  pin = false,
}: PillButtonProps) {
  const base = "flex-row items-center justify-center rounded-pill";
  const byVariant =
    variant === "light"
      ? "bg-card py-3.5 pl-6 pr-3.5"
      : variant === "ghost"
        ? "border border-line py-4 px-6"
        : "bg-brand py-4 px-6";
  const textColor =
    variant === "light" || variant === "ghost" ? "text-foreground" : "text-white";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || busy }}
      disabled={disabled || busy}
      onPress={onPress}
      testID={testID}
      className={`${base} ${byVariant} ${disabled || busy ? "opacity-50" : ""}`}
    >
      <Text className={`text-md font-bold ${textColor}`}>{label}</Text>
      {pin && variant === "light" ? (
        <View className="ml-3 h-8 w-8 items-center justify-center rounded-full bg-brand">
          <Text className="text-sm text-white" accessibilityElementsHidden>
            ↗
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
