const { execFileSync } = require("node:child_process");
const path = require("node:path");

const cli = path.resolve("node_modules/expo-updates/bin/cli.js");
const base = {
  ...process.env,
  EXPO_PROJECT_ID: "00000000-0000-4000-8000-000000000000",
  EAS_CHANNEL: "development",
  EXPO_PUBLIC_ENV: "development",
  EXPO_PUBLIC_SITE_URL: "https://example.com",
};
function fingerprint(platform, overrides) {
  const result = execFileSync(
    process.execPath,
    [
      cli,
      "fingerprint:generate",
      "--platform",
      platform,
      "--workflow",
      "managed",
    ],
    { env: { ...base, ...overrides }, encoding: "utf8" },
  );
  return JSON.parse(result).hash;
}
for (const platform of ["android", "ios"]) {
  const build = fingerprint(platform, {
    ANDROID_VERSION_CODE: "83",
    IOS_BUILD_NUMBER: "83",
    EXPO_PUBLIC_OTA_REVISION: "83",
  });
  const update = fingerprint(platform, {
    ANDROID_VERSION_CODE: "1",
    IOS_BUILD_NUMBER: "1",
    EXPO_PUBLIC_OTA_REVISION: "99",
  });
  const nativeChange = fingerprint(platform, {
    ANDROID_VERSION_CODE: "1",
    IOS_BUILD_NUMBER: "1",
    EXPO_PUBLIC_OTA_REVISION: "99",
    EXPO_PUBLIC_SITE_URL: "https://different.example.com",
  });
  if (build !== update)
    throw new Error("Release counters changed the native fingerprint");
  if (build === nativeChange)
    throw new Error(
      "Native app-link configuration did not change the fingerprint",
    );
}
console.log(
  "Fingerprint ignores release counters and detects native configuration changes.",
);
