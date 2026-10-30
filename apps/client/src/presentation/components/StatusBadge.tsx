/**
 * StatusBadge — event availability badge (RBT-030, RBT-080 a11y).
 *
 * Renders a `badgeFor()` result. Status is NEVER color-only: every tone pairs a
 * color with an icon glyph AND the text label, so the meaning survives for
 * color-blind users and screen readers (WCAG 2.1 AA, RBT-080 AC1).
 */
import { Text, View } from "react-native";

import type { BadgeTone } from "@domain/rules/event-display";

/** Tailwind background + icon per tone. Color + icon + label (never color-only). */
const TONE: Record<BadgeTone, { bg: string; icon: string }> = {
  ok: { bg: "bg-ok", icon: "●" },
  low: { bg: "bg-warn", icon: "▲" },
  soon: { bg: "bg-brand", icon: "◷" },
  soldout: { bg: "bg-ink", icon: "✕" },
  done: { bg: "bg-muted", icon: "✓" },
};

export interface StatusBadgeProps {
  readonly tone: BadgeTone;
  readonly label: string;
}

export function StatusBadge({ tone, label }: StatusBadgeProps) {
  const t = TONE[tone];
  return (
    <View
      className={`flex-row items-center gap-1 rounded-pill px-2.75 py-1 ${t.bg}`}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${label}`}
    >
      <Text className="text-2xs text-white" accessibilityElementsHidden>
        {t.icon}
      </Text>
      <Text className="text-2xs font-bold uppercase text-white">{label}</Text>
    </View>
  );
}
