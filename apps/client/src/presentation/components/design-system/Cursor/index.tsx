/**
 * Cursor — custom brutalist cursor (RBT-087), WEB + fine-pointer only.
 *
 * Prototype: a ring + dot that follow the pointer (dot instant, ring eased),
 * scaling up over interactive elements, with `mix-blend-mode: difference`.
 * Renders NOTHING on native or coarse-pointer devices — the prototype itself
 * hides it under `@media (hover:none),(pointer:coarse)`. Reduced-motion hides
 * it entirely (the prototype's reduced-motion block does the same).
 *
 * Implemented with direct DOM listeners on web only, so it never ships RN work
 * to native. Must be mounted once near the app root on web.
 */
import { useEffect } from "react";
import { Platform } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { designColors } from "@presentation/theme";

/** True only on web with a fine (mouse) pointer. */
function isFinePointerWeb(): boolean {
  if (Platform.OS !== "web") return false;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function Cursor(): null {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !isFinePointerWeb()) return;
    const doc = globalThis.document as Document | undefined;
    if (!doc) return;

    const ring = doc.createElement("div");
    const dot = doc.createElement("div");
    const base =
      "position:fixed;pointer-events:none;z-index:99999;border-radius:50%;mix-blend-mode:difference;";
    ring.style.cssText =
      base +
      `width:20px;height:20px;border:2px solid ${designColors.ground};transition:transform .15s ease,opacity .3s;`;
    dot.style.cssText = base + `width:4px;height:4px;background:${designColors.ground};`;
    doc.body.appendChild(ring);
    doc.body.appendChild(dot);

    let rx = 0,
      ry = 0,
      cx = 0,
      cy = 0,
      raf = 0;
    const onMove = (e: MouseEvent) => {
      cx = e.clientX;
      cy = e.clientY;
      dot.style.left = cx - 2 + "px";
      dot.style.top = cy - 2 + "px";
      const t = e.target as Element | null;
      const hot = !!t?.closest?.("a,button,input,select,[role='button']");
      ring.style.transform = hot ? "scale(2.5)" : "scale(1)";
    };
    const loop = () => {
      rx += (cx - rx) * 0.15;
      ry += (cy - ry) * 0.15;
      ring.style.left = rx - 10 + "px";
      ring.style.top = ry - 10 + "px";
      raf = requestAnimationFrame(loop);
    };
    doc.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);

    return () => {
      doc.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      ring.remove();
      dot.remove();
    };
  }, [reduced]);

  return null;
}
