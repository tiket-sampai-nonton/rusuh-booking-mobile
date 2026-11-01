const path = require("path");

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// --- query-string CJS interop (RBT-020) ---------------------------------
// `query-string@9` is pure ESM; `expo-router@4` requires it as CommonJS and
// calls the FLAT `queryString.stringify(...)` API, which v9 only exposes under
// `.default` → runtime `queryString.stringify is not a function`. We keep v9
// (pinned for native-boot compat) and redirect the bare `query-string`
// specifier to a thin shim that re-exports v9's functions flat. The shim itself
// imports `query-string/base.js`, so only the EXACT bare specifier is aliased —
// no resolution loop.
const QS_SHIM = path.resolve(__dirname, "shims/query-string.js");
const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "query-string") {
    return { type: "sourceFile", filePath: QS_SHIM };
  }
  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
