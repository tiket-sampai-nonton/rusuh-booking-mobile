const palette = {
  brandPrimary: "#EC1C24",
  brandDeep: "#A8111B",
  brandEmber: "#FF5A2D",
  brandMarkPrimary: "#EC1C24",
  brandMarkDeep: "#A8111B",
  brandMarkWhite: "#FFFFFF",
  brandMarkStroke: "#F3F0F0",
  transparent: "transparent",
  ground: "#FFFFFF",
  darkBackground: "#0A0A0C",
  ink: "#000000",
  inkSoft: "#121217",
  card: "#FFFFFF",
  darkCard: "#121217",
  darkForeground: "#FFFFFF",
  muted: "#666666",
  mutedDark: "rgba(255,255,255,0.62)",
  gray: "#888888",
  field: "#F5F5F5",
  success: "#00AA00",
  successDark: "#4ADE80",
  warning: "#FF6600",
  warningDark: "#F5B301",
  error: "#EC1C24",
  errorDark: "#FF6A4C",
  zoneOk: "#E8F5E9",
  zoneOkText: "#1B5E20",
  zoneWarn: "#FFF3E0",
  zoneWarnText: "#E65100",
  zoneBad: "#FFEBEE",
  zoneBadText: "#B71C1C",
};

function withAlpha(hex, alpha) {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red},${green},${blue},${alpha})`;
}

const colorTokens = {
  brand: {
    DEFAULT: palette.brandPrimary,
    deep: palette.brandDeep,
    ember: palette.brandEmber,
  },
  brandMark: {
    primary: palette.brandMarkPrimary,
    deep: palette.brandMarkDeep,
    white: palette.brandMarkWhite,
    stroke: palette.brandMarkStroke,
  },
  transparent: palette.transparent,
  background: { DEFAULT: palette.ground, dark: palette.darkBackground },
  foreground: { DEFAULT: palette.ink, dark: palette.darkForeground },
  card: {
    DEFAULT: palette.card,
    foreground: palette.ink,
    dark: palette.darkCard,
    "dark-foreground": palette.darkForeground,
  },
  muted: {
    DEFAULT: palette.muted,
    foreground: palette.muted,
    dark: palette.mutedDark,
  },
  line: {
    DEFAULT: withAlpha(palette.ink, 0.14),
    dark: withAlpha(palette.darkForeground, 0.18),
  },
  ink: { DEFAULT: palette.ink, 2: palette.inkSoft },
  paper: palette.ground,
  ok: { DEFAULT: palette.success, dark: palette.successDark },
  warn: { DEFAULT: palette.warning, dark: palette.warningDark },
  error: { DEFAULT: palette.error, dark: palette.errorDark },
  v2: {
    ink: palette.ink,
    ground: palette.ground,
    overlay: palette.darkBackground,
    muted: palette.muted,
    gray: palette.gray,
    field: palette.field,
    accent: palette.brandPrimary,
    ember: palette.brandEmber,
    danger: palette.error,
    success: palette.success,
    warn: palette.warning,
    info: palette.brandDeep,
    "zone-ok": palette.zoneOk,
    "zone-ok-border": palette.success,
    "zone-ok-text": palette.zoneOkText,
    "zone-warn": palette.zoneWarn,
    "zone-warn-border": palette.warning,
    "zone-warn-text": palette.zoneWarnText,
    "zone-bad": palette.zoneBad,
    "zone-bad-border": palette.error,
    "zone-bad-text": palette.zoneBadText,
  },
};

/**
 * SINGLE design-token source of truth (NativeWind) — RBT-003.
 *
 * Layout and typography follow the prototype V5 design system. The visual balance
 * targets 45% black, 45% white, and 10% red accents, with separate semantic
 * status colors.
 * `src/presentation/theme/` derives values from this palette for contexts
 * NativeWind cannot style (SVG / Canvas / QR / Reanimated) — it mirrors this
 * file and is never an independent source.
 *
 * The `palette` object below is the only place raw color values are declared.
 * Runtime tokens and Tailwind aliases derive from it; token tests verify parity.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // NativeWind class strategy: `dark:` variants activate under a `dark`
  // class / the OS scheme (app.config userInterfaceStyle: "automatic").
  darkMode: "class",
  theme: {
    extend: {
      colors: colorTokens,

      // ---- Typography (prototype font-size scale, px → rem @16) ----
      fontFamily: {
        // Use the exact family registered by expo-font on web and native.
        sans: [
          "PlusJakartaSans_400Regular",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      fontSize: {
        // Named steps mapped from the discrete px sizes used in the prototype.
        micro: ["0.5rem", { lineHeight: "0.75rem" }], //   8px
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }], // 10px
        xs: ["0.75rem", { lineHeight: "1rem" }], //         12px
        sm: ["0.8125rem", { lineHeight: "1.125rem" }], //   13px (nav/body)
        base: ["0.875rem", { lineHeight: "1.25rem" }], //   14px (section copy)
        md: ["0.9375rem", { lineHeight: "1.375rem" }], //   15px (buttons/inputs)
        lg: ["1rem", { lineHeight: "1.5rem" }], //          16px
        xl: ["1.125rem", { lineHeight: "1.625rem" }], //    18px
        "2xl": ["1.25rem", { lineHeight: "1.75rem" }], //   20px
        "3xl": ["1.5rem", { lineHeight: "1.875rem" }], //   24px
        display: ["2.375rem", { lineHeight: "2.625rem" }], // 38px
        hero: ["3rem", { lineHeight: "3.25rem" }], //       48px
        // ---- V2 Brutalist Mono fluid display scale (prototype 01 :root) ----
        "v2-xl": ["clamp(1.5rem, 3vw, 2rem)", { lineHeight: "1.1" }], // --text-xl
        "v2-hero": ["clamp(3rem, 12vw, 10rem)", { lineHeight: "0.85" }], // --text-hero
      },
      fontWeight: {
        // prototype weights: 600 / 700 / 800
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },
      borderWidth: {
        // V2 Brutalist Mono hard borders (RBT-086).
        v2: "2px", //       default brutalist border (most V2 screens)
        "v2-heavy": "3px", // waiting-room variant (prototype 06 uses 3px)
      },
      letterSpacing: {
        // prototype .tag uppercase labels use letter-spacing:.2em
        tag: "0.2em",
      },

      // ---- Spacing (prototype paddings: 6/7/8/9/11/12/13/14/15/18/22/26/30px) ----
      spacing: {
        0.75: "0.1875rem", // 3px
        1.5: "0.375rem", //   6px
        1.75: "0.4375rem", // 7px
        2.25: "0.5625rem", // 9px
        2.75: "0.6875rem", // 11px
        3.25: "0.8125rem", // 13px
        3.5: "0.875rem", //   14px
        3.75: "0.9375rem", // 15px
        4.5: "1.125rem", //   18px
        5.5: "1.375rem", //   22px
        6.5: "1.625rem", //   26px
        7.5: "1.875rem", //   30px
      },

      // ---- Radius (prototype: 7/9/10/12/14/16/18/20/22/24/26/999px) ----
      borderRadius: {
        mk: "0.4375rem", //   7px   (brand mark)
        sm: "0.5625rem", //   9px
        DEFAULT: "0.625rem", // 10px
        md: "0.75rem", //     12px  (inputs/fields)
        lg: "0.875rem", //    14px
        xl: "1rem", //        16px
        "2xl": "1.25rem", //  20px  (empty-state / cards)
        "3xl": "1.375rem", // 22px
        "4xl": "1.5rem", //   24px
        "5xl": "1.625rem", // 26px
        pill: "62.4375rem", // 999px (fully round)
        full: "9999px",
      },

      // ---- Motion (prototype ease + duration steps) ----
      transitionTimingFunction: {
        // prototype --ease (used everywhere)
        brand: "cubic-bezier(0.32, 0.72, 0, 1)",
        // ---- V2 Brutalist Mono eases (RBT-086) ----
        v2: "cubic-bezier(0.16, 1, 0.3, 1)", //          --ease
        "v2-out": "cubic-bezier(0.33, 1, 0.68, 1)", //   --ease-out
        "v2-elastic": "cubic-bezier(0.68, -0.6, 0.32, 1.6)", // --ease-elastic
        "v2-expo": "cubic-bezier(0.76, 0, 0.24, 1)", //  flow-screen loader/fill ease
      },
      transitionDuration: {
        250: "250ms", // .25s
        350: "350ms", // .35s
        400: "400ms", // .4s  (primary interactive transition)
        600: "600ms", // .6s
        700: "700ms", // .7s
      },

      // ---- Shadows (prototype box-shadows on cards/buttons) ----
      boxShadow: {
        brand: `0 4px 16px -2px ${withAlpha(palette.ink, 0.28)}`,
        button: `0 14px 40px -12px ${withAlpha(palette.ink, 0.42)}`,
        filter: `0 12px 30px -24px ${withAlpha(palette.ink, 0.5)}`,
        ok: `0 16px 40px -14px ${withAlpha(palette.ink, 0.36)}`,
      },
    },
  },
  plugins: [],
};
