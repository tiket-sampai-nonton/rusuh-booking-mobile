const { withProjectBuildGradle } = require("expo/config-plugins");

const marker = "// Notifee Android local Maven repository";

module.exports = (config) =>
  withProjectBuildGradle(config, (result) => {
    const contents = result.modResults.contents;
    if (contents.includes(marker)) return result;

    const repositoriesBlock = /allprojects\s*\{\s*repositories\s*\{/;
    if (!repositoriesBlock.test(contents)) {
      throw new Error(
        "Android allprojects repositories block not found; review the Notifee config plugin.",
      );
    }

    const localRepository =
      `\n      ${marker}\n` +
      `      maven { url(new File(rootDir, "../node_modules/@notifee/react-native/android/libs")) }`;
    result.modResults.contents = contents.replace(
      repositoriesBlock,
      (match) => `${match}${localRepository}`,
    );
    return result;
  });
