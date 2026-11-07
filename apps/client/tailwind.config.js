/**
 * SINGLE design-token source of truth (NativeWind) — RBT-003.
 *
 * Layout and typography follow the prototype V5 design system. The color palette
 * is temporarily set to green and yellow for the EAS OTA test.
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
        // ---- Green + yellow OTA test palette ----
        brand: {
          DEFAULT: "#15803D", // accessible leaf green for primary actions
          deep: "#166534", //    forest green
          yellow: "#FACC15", //  bright yellow accent
          "yellow-deep": "#A16207", // readable amber for labels and borders
          "yellow-light": "#FEF08A", // pale yellow highlight
        },

        // ---- Semantic surface PAIRS (AC2: bg+text always paired) ----
        // Light surfaces use a soft green tint; dark surfaces use deep green.
        background: {
          DEFAULT: "#F6F9F4",
          dark: "#0B1710",
        },
        foreground: {
          DEFAULT: "#142519",
          dark: "#F1F8F1",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#142519",
          dark: "#13251A",
          "dark-foreground": "#F1F8F1",
        },
        muted: {
          DEFAULT: "#58665A",
          foreground: "#58665A",
          dark: "#B7C8BA",
        },
        line: {
          DEFAULT: "rgba(20,37,25,0.14)",
          dark: "rgba(213,237,219,0.18)",
        },
        ink: {
          DEFAULT: "#142519",
          2: "#24452E",
        },
        paper: "#F6F9F4",

        // ---- Status (prototype --ok / --warn, + dark-context hues) ----
        ok: {
          DEFAULT: "#15803D",
          dark: "#86EFAC",
        },
        warn: {
          DEFAULT: "#A16207",
          dark: "#FDE047",
        },
        error: {
          DEFAULT: "#B42318",
          dark: "#FDA29B",
        },

        // ============================================================
        // Raw drawing surfaces and aliases mirrored by runtime color tokens.
        // ============================================================
        v2: {
          ink: "#142519",
          ground: "#F6F9F4",
          overlay: "#0B1710",
          muted: "#58665A",
          gray: "#687A6B",
          field: "#EAF2E7",
          accent: "#15803D",
          yellow: "#FACC15",
          "yellow-deep": "#A16207",
          danger: "#B42318",
          success: "#15803D",
          warn: "#A16207",
          info: "#2F7A49",
          "zone-ok": "#E9F6EC",
          "zone-ok-border": "#15803D",
          "zone-ok-text": "#14532D",
          "zone-warn": "#FEF9C3",
          "zone-warn-border": "#A16207",
          "zone-warn-text": "#713F12",
          "zone-bad": "#FEF2F2",
          "zone-bad-border": "#B42318",
          "zone-bad-text": "#991B1B",
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
        brand: "0 4px 16px -2px rgba(21,128,61,0.28)",
        button: "0 14px 40px -12px rgba(20,37,25,0.42)",
        filter: "0 12px 30px -24px rgba(36,69,46,0.5)",
        ok: "0 16px 40px -14px rgba(21,128,61,0.36)",
      },
    },
  },
  plugins: [],
};
