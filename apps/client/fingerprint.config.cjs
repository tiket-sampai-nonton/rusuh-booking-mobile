// Release counters identify artifacts; they do not alter the native runtime.
// Keep all other Expo configuration in the fingerprint, including app version,
// plugins, permissions, bundle identifiers, assets and native dependencies.
module.exports = {
  fileHookTransform(source, chunk) {
    if (source.type !== "contents" || source.id !== "expoConfig") return chunk;
    const config = JSON.parse(chunk.toString());
    if (config.android) delete config.android.versionCode;
    if (config.ios) delete config.ios.buildNumber;
    if (config.extra?.buildInfo) delete config.extra.buildInfo.otaRevision;
    return JSON.stringify(config);
  },
};
