module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@domain": "./src/domain",
            "@application": "./src/application",
            "@infrastructure": "./src/infrastructure",
            "@presentation": "./src/presentation",
            "@providers": "./src/providers",
            "@shared": "./src/shared",
          },
        },
      ],
      // react-native-reanimated/plugin must be listed last.
      "react-native-reanimated/plugin",
    ],
  };
};
