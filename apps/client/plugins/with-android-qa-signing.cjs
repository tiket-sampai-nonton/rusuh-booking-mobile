const { withAppBuildGradle } = require("expo/config-plugins");

const marker = "// RBT-084 QA release signing";

const debugSigningBlock = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`;

const releaseBuildBlock = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;

const qaSigningConfigsBlock = `    signingConfigs {
        debug {
            ${marker}
            def qaKeystorePath = System.getenv("ANDROID_KEYSTORE_PATH")
            def qaKeystorePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
            def qaKeyAlias = System.getenv("ANDROID_KEY_ALIAS")
            def qaKeyPassword = System.getenv("ANDROID_KEY_PASSWORD")
            def qaSigningValues = [qaKeystorePath, qaKeystorePassword, qaKeyAlias, qaKeyPassword]

            if (qaSigningValues.any { it } && !qaSigningValues.every { it }) {
                throw new GradleException("Android QA signing credentials are incomplete.")
            }

            if (qaSigningValues.every { it }) {
                storeFile file(qaKeystorePath)
                storePassword qaKeystorePassword
                keyAlias qaKeyAlias
                keyPassword qaKeyPassword
            } else {
                storeFile file('debug.keystore')
                storePassword 'android'
                keyAlias 'androiddebugkey'
                keyPassword 'android'
            }
        }
        release {
            ${marker}
            def qaKeystorePath = System.getenv("ANDROID_KEYSTORE_PATH")
            def qaKeystorePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
            def qaKeyAlias = System.getenv("ANDROID_KEY_ALIAS")
            def qaKeyPassword = System.getenv("ANDROID_KEY_PASSWORD")
            def qaSigningValues = [qaKeystorePath, qaKeystorePassword, qaKeyAlias, qaKeyPassword]

            if (qaSigningValues.any { it } && !qaSigningValues.every { it }) {
                throw new GradleException("Android QA signing credentials are incomplete.")
            }

            if (qaSigningValues.every { it }) {
                storeFile file(qaKeystorePath)
                storePassword qaKeystorePassword
                keyAlias qaKeyAlias
                keyPassword qaKeyPassword
            } else {
                initWith signingConfigs.debug
            }
        }
    }`;

module.exports = (config) =>
  withAppBuildGradle(config, (result) => {
    const contents = result.modResults.contents;
    if (contents.includes(marker)) return result;

    if (
      !contents.includes(debugSigningBlock) ||
      !contents.includes(releaseBuildBlock)
    ) {
      throw new Error(
        "Android Gradle signing blocks changed; review the RBT-084 QA signing config plugin.",
      );
    }

    result.modResults.contents = contents
      .replace(debugSigningBlock, qaSigningConfigsBlock)
      .replace(
        releaseBuildBlock,
        "        release {\n            signingConfig signingConfigs.release",
      );

    return result;
  });
