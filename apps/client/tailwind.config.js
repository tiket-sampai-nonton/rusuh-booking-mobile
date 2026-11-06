/**
 * SINGLE design-token source of truth (NativeWind) — RBT-003.
 *
 * Tokens are ported verbatim from the prototype V5 design system
 * (`.genesis/prototype/Final/*.html` `:root` blocks). See ARCHITECTURE.md §6.5.
 * `src/presentation/theme/` re-exports the SAME raw values for contexts
 * NativeWind cannot style (SVG / Canvas / QR / Reanimated) — it mirrors this
 * file and is never an independent source.
 *
 * Light values come straight from the prototype. The prototype ships NO full
 * dark palette (it is a light design), so dark values are DERIVED:
 *   - brand/status hues reuse the prototype's dark-context tweaks found in
 *     `waiting.html` (`--muted:rgba(255,255,255,.62)`, `--ok:#4ade80`,
 *     `--amber:#f5b301`) where they exist;
 *   - surface/ink/line dark values are a sensible inversion of the light set.
 * Every DERIVED (non-prototype) value is marked `DERIVED (flag)` below.
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
        // ---- Brand (prototype: --red / --red-deep / --ember) ----
        brand: {
          DEFAULT: "#EC1C24", // --red
          deep: "#a8111b", //    --red-deep
          ember: "#ff5a2d", //   --ember
        },

        // ---- Semantic surface PAIRS (AC2: bg+text always paired) ----
        // light = prototype --paper/--ink/--card/--muted/--line
        // dark  = DERIVED (flag): prototype has no dark surfaces.
        background: {
          DEFAULT: "#fbfbfd", //          --paper
          dark: "#0a0a0c", //             DERIVED (flag): = light --ink
        },
        foreground: {
          DEFAULT: "#0a0a0c", //          --ink
          dark: "#fbfbfd", //             DERIVED (flag): = light --paper
        },
        card: {
          DEFAULT: "#ffffff", //          --card
          foreground: "#0a0a0c", //       pairs with card (--ink)
          dark: "#121217", //             DERIVED (flag): = --ink-2
          "dark-foreground": "#fbfbfd", // DERIVED (flag)
        },
        muted: {
          DEFAULT: "#6b6b76", //          --muted (used as muted-foreground text)
          foreground: "#6b6b76", //       --muted
          dark: "rgba(255,255,255,0.62)", // prototype waiting.html dark --muted
        },
        line: {
          DEFAULT: "rgba(10,10,12,0.08)", // --line
          dark: "rgba(255,255,255,0.12)", // DERIVED (flag)
        },
        ink: {
          DEFAULT: "#0a0a0c", //          --ink
          2: "#121217", //                --ink-2
        },
        paper: "#fbfbfd", //              --paper (raw alias)

        // ---- Status (prototype --ok / --warn, + dark-context hues) ----
        ok: {
          DEFAULT: "#17a34a", //          --ok
          dark: "#4ade80", //             waiting.html dark --ok
        },
        warn: {
          DEFAULT: "#e8830c", //          --warn (index); detail/payment use #e8830c
          dark: "#f5b301", //             waiting.html --amber
        },
        // No explicit --err token in the prototype; error reuses brand red.
        // DERIVED (flag): dedicated error hue mapped to brand for clarity.
        error: {
          DEFAULT: "#EC1C24", //          DERIVED (flag): = --red
          dark: "#ff6a4c", //             DERIVED (flag): lightened red for dark bg
        },

        // ============================================================
        // V2 "Brutalist Mono" palette (RBT-086) — the redesign token set.
        // Unifies the prototype's TWO systems into ONE:
        //   home/event-detail  --ground/--ink/--ink-muted/--field/--accent/--danger
        //   flow screens       --black/--white/--gray/--red/--green
        // Resolution: pure #000/#fff base; one muted gray; one accent red; one
        // success green; danger = the accent red. Prototype-specific accents
        // (live-dot, warn/amber, info blue) kept as named tokens, not literals.
        // ============================================================
        v2: {
          ink: "#000000", //        --ink / --black  (pure black)
          ground: "#ffffff", //     --ground / --white (pure white)
          muted: "#666666", //      --ink-muted (home) — the readable gray
          gray: "#888888", //       --gray (flow screens) — secondary gray
          field: "#f5f5f5", //      --field (input/elevated surface)
          accent: "#ff0000", //     --red (flow) brutalist accent / live red
          danger: "#dc2626", //     --danger (home) destructive
          success: "#00aa00", //    --green (flow success); draw-check uses it
          warn: "#ff6600", //       offline/warning (waiting status badge)
          info: "#3b82f6", //       --info (browse b-soon blue), prototype accent
          // Waiting-room zone banner tints (prototype 06 .zone.*)
          "zone-ok": "#e8f5e9",
          "zone-ok-border": "#2e7d32",
          "zone-ok-text": "#1b5e20",
          "zone-warn": "#fff3e0",
          "zone-warn-border": "#f57c00",
          "zone-warn-text": "#e65100",
          "zone-bad": "#ffebee",
          "zone-bad-border": "#c62828",
          "zone-bad-text": "#b71c1c",
        },
      },

      // ---- Typography (prototype font-size scale, px → rem @16) ----
      fontFamily: {
        // Use the exact family registered by expo-font on web and native.
        sans: ["Inter_400Regular", "system-ui", "-apple-system", "sans-serif"],
        // ---- V2 Brutalist Mono (RBT-086) ----
        // V2 body/display font: Inter 400/500/700/900.
        v2: ["Inter_400Regular", "system-ui", "-apple-system", "sans-serif"],
        // Waiting-room MONO variant (prototype 06-waiting uses JetBrains Mono).
        // DECISION: kept as a deliberate variant for the queue/terminal feel,
        // NOT normalized away — scoped to the waiting room via `font-v2-mono`.
        "v2-mono": ["JetBrains Mono", "ui-monospace", "monospace"],
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
        // V2 Brutalist Mono uses 900 (black) for display/hero + 400/500/700.
        black: "900",
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
        brand: "0 4px 12px -2px rgba(236,28,36,0.5)", //  brand mark
        button: "0 14px 40px -12px rgba(0,0,0,0.5)", //   primary button
        filter: "0 12px 30px -24px rgba(10,10,12,0.5)", // filter/ghost
        ok: "0 16px 40px -14px rgba(23,163,74,0.7)", //   success check
      },
    },
  },
  plugins: [],
};
