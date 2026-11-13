/**
 * ScrollProgress — top scroll-progress bar (RBT-087), WEB only.
 *
 * Prototype `.scroll-progress`: a 3px ink bar pinned to the top that scales
 * with document scroll. This is a window-scroll affordance that only makes
 * sense on web (native screens scroll their own ScrollView). Renders NOTHING
 * on native. Honors reduced-motion by skipping the smooth transition (the bar
 * still reflects position, it just does not animate width).
 */
import { useEffect } from "react";
import { Platform } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { designColors } from "@presentation/theme";

export function ScrollProgress(): null {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const doc = globalThis.document as Document | undefined;
    const win = globalThis.window as Window | undefined;
    if (!doc || !win) return;

    const bar = doc.createElement("div");
    bar.dataset.testid = "v2-scroll-progress";
    bar.style.cssText =
      `position:fixed;top:0;left:0;height:3px;width:100%;background:${designColors.ink};` +
      `transform-origin:left;transform:scaleX(0);z-index:1000;` +
      (reduced ? "" : "transition:transform .1s linear;");
    doc.body.appendChild(bar);

    const onScroll = () => {
      const el = doc.documentElement;
      const max = el.scrollHeight - win.innerHeight;
      const ratio = max > 0 ? win.scrollY / max : 0;
      bar.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
    };
    win.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      win.removeEventListener("scroll", onScroll);
      bar.remove();
    };
  }, [reduced]);

  return null;
}
