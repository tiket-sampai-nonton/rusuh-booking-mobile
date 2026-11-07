const config = {
  name: "Rusuh Booking",
  slug: "rusuh-booking-mobile",
  scheme: "rusuhbooking",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  // SDK 53 uses Hermes; validated with an iOS simulator smoke run after fixing
  // the required QueryClient provider wiring.
  jsEngine: "hermes",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.tiketsampainonton.rusuhbooking",
  },
  android: { package: "com.tiketsampainonton.rusuhbooking" },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png",
    // RBT-033: static rendering so public routes (/, /browse, /events/[id],
    // /history) emit indexable HTML per route (D6.2 — never ship a public
    // route as "single"). Transactional routes are marked noindex via Head.
    output: "static",
  },
  plugins: [
    [
      "expo-router",
      {
        origin:
          process.env.EXPO_PUBLIC_SITE_URL || "https://rusuh-booking.pages.dev",
        // Split web route code into async chunks in production so the initial
        // public and transactional JavaScript can meet the D6.2 budgets.
        // Expo Router keeps native development/builds unaffected.
        asyncRoutes: "production",
      },
    ],
    "expo-asset",
    "expo-font",
    "./plugins/with-ios-fmt-compat.cjs",
  ],
  experiments: { typedRoutes: true },
};
export default config;
