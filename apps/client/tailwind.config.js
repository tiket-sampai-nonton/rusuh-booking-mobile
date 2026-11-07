/**
 * SINGLE design-token source of truth (NativeWind) — RBT-003.
 *
 * Layout and typography follow the prototype V5 design system. The color palette
 * is temporarily overridden with cyberpunk colors for the EAS OTA test.
 * `src/presentation/theme/` re-exports the SAME raw values for contexts
 * NativeWind cannot style (SVG / Canvas / QR / Reanimated) — it mirrors this
 * file and is never an independent source.
 *
 * The raw color values are mirrored in `src/presentation/theme/` for drawing
 * surfaces that NativeWind cannot style; token tests verify that mirror.
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
      colors: {
        // ---- Cyberpunk OTA test palette ----
        brand: {
          DEFAULT: "#7C3AED", // electric purple
          deep: "#5B21B6", //    deep violet
          ember: "#FF32C8", //   neon magenta
          cyan: "#007F9E", //    accessible cyan accent
          "neon-cyan": "#49E8FF",
        },

        // ---- Semantic surface PAIRS (AC2: bg+text always paired) ----
        // Light surfaces use a lavender tint; dark surfaces use deep violet.
        background: {
          DEFAULT: "#F7F2FF",
          dark: "#0B0614",
        },
        foreground: {
          DEFAULT: "#1B1026",
          dark: "#F7F2FF",
        },
        card: {
          DEFAULT: "#FFFCFF",
          foreground: "#1B1026",
          dark: "#170D24",
          "dark-foreground": "#F7F2FF",
        },
        muted: {
          DEFAULT: "#665873",
          foreground: "#665873",
          dark: "#C7B8D8",
        },
        line: {
          DEFAULT: "rgba(43,19,67,0.14)",
          dark: "rgba(220,190,255,0.18)",
        },
        ink: {
          DEFAULT: "#1B1026",
          2: "#28113D",
        },
        paper: "#F7F2FF",

        // ---- Status (prototype --ok / --warn, + dark-context hues) ----
        ok: {
          DEFAULT: "#087F68",
          dark: "#5EEAD4",
        },
        warn: {
          DEFAULT: "#9A5B00",
          dark: "#FFD166",
        },
        error: {
          DEFAULT: "#C02677",
          dark: "#FF7AB6",
        },

        // ============================================================
        // Cyberpunk palette for the OTA visual test. Keep these semantic
        // aliases aligned with event-design-tokens.ts.
        // ============================================================
        v2: {
          ink: "#1B1026",
          ground: "#F7F2FF",
          overlay: "#0B0614",
          muted: "#665873",
          gray: "#756686",
          field: "#EEE5FA",
          accent: "#7C3AED",
          magenta: "#FF32C8",
          cyan: "#007F9E",
          "neon-cyan": "#49E8FF",
          danger: "#C02677",
          success: "#087F68",
          warn: "#9A5B00",
          info: "#007F9E",
          "zone-ok": "#E5F8F2",
          "zone-ok-border": "#087F68",
          "zone-ok-text": "#075B4B",
          "zone-warn": "#FFF5D9",
          "zone-warn-border": "#9A5B00",
          "zone-warn-text": "#744400",
          "zone-bad": "#FCE7F3",
          "zone-bad-border": "#C02677",
          "zone-bad-text": "#8F1D5A",
        },
      },

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
        brand: "0 4px 16px -2px rgba(124,58,237,0.48)",
        button: "0 14px 40px -12px rgba(27,16,38,0.42)",
        filter: "0 12px 30px -24px rgba(43,19,67,0.5)",
        ok: "0 16px 40px -14px rgba(8,127,104,0.45)",
      },
    },
  },
  plugins: [],
};
