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
        // SPA for the RBT-001 skeleton. Static/SSR SEO output (web.output:"static")
        // is wired in RBT-033; it needs the router prerender env which is set up there.
        output: "single",
    },
    plugins: ["expo-router", "expo-asset", "expo-font"],
    experiments: { typedRoutes: true },
};
export default config;
