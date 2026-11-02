const config = {
    name: "Rusuh Booking",
    slug: "rusuh-booking-mobile",
    scheme: "rusuhbooking",
    version: "0.1.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    // JSC for the RBT-001 skeleton: a transitive dep ships a regex Hermes rejects
    // ("Invalid flags"). Hermes/engine tuning is revisited in RBT-081 (perf).
    jsEngine: "jsc",
    ios: { supportsTablet: true, bundleIdentifier: "com.tiketsampainonton.rusuhbooking" },
    android: { package: "com.tiketsampainonton.rusuhbooking" },
    web: {
        bundler: "metro",
        // RBT-033: static rendering so public routes (/, /browse, /events/[id],
        // /history) emit indexable HTML per route (D6.2 — never ship a public
        // route as "single"). Transactional routes are marked noindex via Head.
        output: "static",
    },
    plugins: ["expo-router", "expo-asset", "expo-font"],
    experiments: { typedRoutes: true },
};
export default config;
