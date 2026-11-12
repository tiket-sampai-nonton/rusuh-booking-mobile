const { withAppBuildGradle } = require("expo/config-plugins");

const marker = "// RBT-129 standalone QA debug bundle";

module.exports = (config) =>
  withAppBuildGradle(config, (result) => {
    const contents = result.modResults.contents;
    if (contents.includes(marker)) return result;

    const reactBlock = /react\s*\{\s*/;
    if (!reactBlock.test(contents)) {
      throw new Error(
        "React Native Gradle configuration not found; review the QA bundle config plugin.",
      );
    }

    result.modResults.contents = contents.replace(
      reactBlock,
      (match) =>
        `${match}\n    ${marker}\n` +
        `    if (System.getenv("RBT_BUNDLE_DEBUG") == "true") {\n` +
        `        debuggableVariants = []\n` +
        `    }\n`,
    );
    return result;
  });
