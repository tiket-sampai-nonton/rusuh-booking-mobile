/**
 * Expired PageScreen — parent component (orchestration only).
 *
 * 1:1 of the prototype `expired.html` (RBT-064, E7/E6). The `reason` query param
 * drives the copy (copy.ts); the CTA re-queues from the start and clears stale
 * session state (D7.4). Markup → ./fragments, styles → ./style, types →
 * ./interface, copy → ./copy (presentation refactor rule).
 */
import { useRouter, type Href } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuraBackground } from "@presentation/components/AuraBackground";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useSessionStore } from "@presentation/stores/session-store";

import { copyFor } from "./copy";
import { ExpiredActions } from "./fragments/ExpiredActions";
import { ExpiredGlyph } from "./fragments/ExpiredGlyph";
import type { ExpiredScreenProps } from "./interface";
import { expiredContainer, expiredStyles } from "./style";

export function ExpiredScreen({ resourceId, reason }: ExpiredScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const eventId = useSessionStore((s) => s.eventId);
  const reset = useSessionStore((s) => s.reset);
  const c = copyFor(reason);

  const onRequeue = (): void => {
    const target = eventId; // re-queue to the same event when known
    reset();
    router.replace((target ? `/events/${target}` : "/") as Href);
  };
  const onHome = (): void => {
    reset();
    router.replace("/" as Href);
  };

  return (
    <ScreenFade>
      <AuraBackground tone="error" testID="expired-screen">
        <View
          className="flex-1 items-center justify-center p-5"
          style={expiredContainer(insets.top, insets.bottom)}
        >
          <ExpiredGlyph glyph={c.glyph} />

          <Text
            className="text-2xl font-extrabold text-white"
            style={expiredStyles.title}
            accessibilityRole="header"
            accessibilityLiveRegion="polite"
          >
            {c.title}
          </Text>
          <Text className="mt-2.5 text-center text-sm leading-6 text-white/60" style={expiredStyles.sub}>
            {c.sub}
          </Text>

          {/* Glass info card. */}
          <View className="mt-6 w-full max-w-[400px] rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <Text className="text-xs leading-6 text-white/60">{c.card}</Text>
          </View>
          <Text className="mt-2 text-2xs text-white/40">Ref: {resourceId}</Text>

          <ExpiredActions cta={c.cta} onRequeue={onRequeue} onHome={onHome} />
        </View>
      </AuraBackground>
    </ScreenFade>
  );
}
