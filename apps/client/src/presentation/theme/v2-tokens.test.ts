import tailwind from "../../../tailwind.config.js";

import { v2, v2Border, v2Font, v2Motion, v2Tokens, v2Zone } from "./v2-tokens";

// The tailwind config's v2 color namespace — the single source of truth the
// raw tokens must mirror.
const twV2 = (tailwind as any).theme.extend.colors.v2 as Record<string, string>;

describe("RBT-086 V2 Brutalist Mono raw tokens", () => {
  it("exposes the unified core palette", () => {
    expect(v2).toMatchObject({
      ink: "#000000",
      ground: "#ffffff",
      muted: "#666666",
      gray: "#888888",
      field: "#f5f5f5",
      accent: "#ff0000",
      danger: "#dc2626",
      success: "#00aa00",
      warn: "#ff6600",
      info: "#3b82f6",
    });
  });

  it("MIRRORS the tailwind.config.js v2 namespace exactly (single source)", () => {
    // Every core raw token equals its tailwind counterpart — no drift.
    (["ink", "ground", "muted", "gray", "field", "accent", "danger", "success", "warn", "info"] as const).forEach(
      (k) => {
        expect(v2[k]).toBe(twV2[k]);
      },
    );
  });

  it("maps the waiting-room zone-banner tints to the tailwind tokens", () => {
    expect(v2Zone.ok).toEqual({ bg: "#e8f5e9", border: "#2e7d32", text: "#1b5e20" });
    expect(v2Zone.warn).toEqual({ bg: "#fff3e0", border: "#f57c00", text: "#e65100" });
    expect(v2Zone.bad).toEqual({ bg: "#ffebee", border: "#c62828", text: "#b71c1c" });
    expect(v2Zone.ok.bg).toBe(twV2["zone-ok"]);
    expect(v2Zone.bad.text).toBe(twV2["zone-bad-text"]);
  });

  it("exposes V2 easings as CSS strings AND Reanimated bezier tuples", () => {
    expect(v2Motion.ease).toBe("cubic-bezier(0.16, 1, 0.3, 1)");
    expect(v2Motion.easeBezier).toEqual([0.16, 1, 0.3, 1]);
    expect(v2Motion.elasticBezier).toEqual([0.68, -0.6, 0.32, 1.6]);
    expect(v2Motion.expoBezier).toEqual([0.76, 0, 0.24, 1]);
  });

  it("keeps the brutalist border widths (2px base, 3px heavy waiting variant)", () => {
    expect(v2Border.base).toBe(2);
    expect(v2Border.heavy).toBe(3);
  });

  it("keeps Inter as the V2 font and JetBrains Mono as the waiting variant", () => {
    expect(v2Font.sans).toBe("Inter");
    expect(v2Font.mono).toBe("JetBrains Mono");
  });

  it("bundles everything into v2Tokens", () => {
    expect(v2Tokens.color).toBe(v2);
    expect(v2Tokens.zone).toBe(v2Zone);
    expect(v2Tokens.motion).toBe(v2Motion);
    expect(v2Tokens.border).toBe(v2Border);
    expect(v2Tokens.font).toBe(v2Font);
  });
});
