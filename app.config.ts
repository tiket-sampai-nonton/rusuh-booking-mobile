import type { ExpoConfig } from "expo/config";

// Varian build: local (dev) atau staging (AWS). URL dari env saat build: EXPO_PUBLIC_API_BASE_URL, EXPO_PUBLIC_WEB_BASE_URL.
const variant = process.env.APP_VARIANT ?? "local";

const config: ExpoConfig = {
  name: variant === "staging" ? "Rusuh Booking" : "Rusuh Booking (dev)",
  slug: "rusuh-booking-mobile",
  scheme: "rusuhbooking",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  android: {
    package: variant === "staging" ? "com.tiketsampainonton.rusuhbooking" : "com.tiketsampainonton.rusuhbooking.dev",
  },
  ios: {
    bundleIdentifier: "com.tiketsampainonton.rusuhbooking",
  },
  plugins: ["expo-router"],
  extra: { variant },
};

export default config;
