const androidVersionCode = Number(process.env.ANDROID_VERSION_CODE || "1");
const designTokens = require("./tailwind.config.js").theme.extend.colors;
const appVersion = require("./package.json").version;
const buildEnvironment = process.env.EXPO_PUBLIC_ENV || "development";
const otaRevision = process.env.EXPO_PUBLIC_OTA_REVISION || "0";
const siteUrl = new URL(
  process.env.EXPO_PUBLIC_SITE_URL || "https://rusuh-booking.pages.dev",
);
const expoProjectId = process.env.EXPO_PROJECT_ID;
const easChannel = process.env.EAS_CHANNEL;
if (
  !Number.isSafeInteger(androidVersionCode) ||
  androidVersionCode < 1 ||
  androidVersionCode > 2100000000
) {
  throw new Error(
    "ANDROID_VERSION_CODE must be an integer between 1 and 2100000000.",
  );
}
if (expoProjectId && !["development", "production"].includes(easChannel)) {
  throw new Error(
    "EAS_CHANNEL must be development or production when EXPO_PROJECT_ID is set.",
  );
}
const config = {
  name: "Rusuh Booking",
  owner: "chelseacry",
  slug: "rusuh-booking",
  scheme: "rusuhbooking",
  version: appVersion,
  // Native directories are generated with Expo Prebuild. Derive the OTA
  // runtime from the native project so a later JS-only update cannot reach a
  // binary that predates a native dependency or config-plugin change.
  runtimeVersion: { policy: "fingerprint" },
  ...(expoProjectId
    ? {
        updates: {
          url: `https://u.expo.dev/${expoProjectId}`,
          requestHeaders: { "expo-channel-name": easChannel },
          // The startup bridge performs a bounded manual check and reload. Keep
          // Expo's automatic check only for recovery from a failed update.
          checkAutomatically: "ON_ERROR_RECOVERY",
        },
      }
    : {}),
  extra: {
    ...(expoProjectId ? { eas: { projectId: expoProjectId } } : {}),
    buildInfo: { environment: buildEnvironment, otaRevision },
  },
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  icon: "./assets/app-icon.png",
  splash: {
    image: "./assets/brand-mark.png",
    resizeMode: "contain",
    backgroundColor: designTokens.background.dark,
  },
  newArchEnabled: true,
  // SDK 53 uses Hermes; validated with an iOS simulator smoke run after fixing
  // the required QueryClient provider wiring.
  jsEngine: "hermes",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.tiketsampainonton.rusuhbooking",
    buildNumber: process.env.IOS_BUILD_NUMBER || "1",
    associatedDomains: [`applinks:${siteUrl.host}`],
  },
  android: {
    package: "com.tiketsampainonton.rusuhbooking",
    versionCode: androidVersionCode,
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: siteUrl.host,
            pathPrefix: "/events/",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
    adaptiveIcon: {
      foregroundImage: "./assets/brand-mark.png",
      backgroundColor: designTokens.background.dark,
    },
  },
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
    "expo-updates",
    [
      "react-native-fast-image",
      { maxDiskSize: 536870912, maxMemorySize: 134217728, maxDiskAge: 2592000 },
    ],
    "./plugins/with-android-qa-signing.cjs",
    "./plugins/with-android-qa-bundle.cjs",
    "./plugins/with-android-chucker.cjs",
    "./plugins/with-ios-fmt-compat.cjs",
  ],
  experiments: { typedRoutes: true },
};
export default config;
