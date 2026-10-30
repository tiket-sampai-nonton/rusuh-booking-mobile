/**
 * SINGLE design-token source of truth (NativeWind).
 * RBT-001 ships the wiring with a minimal token stub.
 * RBT-003 populates the full token set generated from prototype V5.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Placeholder brand token — replaced by prototype-V5 tokens in RBT-003.
        brand: "#EE2A24",
      },
    },
  },
  plugins: [],
};
