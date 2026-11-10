const {
  withAppBuildGradle,
  withMainApplication,
} = require("expo/config-plugins");

const gradleMarker = "// Android debug HTTP inspector";
const applicationMarker = "// Chucker debug network inspector";

const sensitivePathRegexes = [
  // API auth/profile, booking, payment, queue, and push subscription payloads
  // may contain credentials, OTPs, NIKs, or bearer/page/visitor tokens.
  String.raw`Regex("""^/(?:[^/]+/)*(?:auth|me|booking-sessions|bookings|payments|payment-page-sessions|queue-entries|push-subscriptions)(?:/.*)?$""")`,
  String.raw`Regex("""^/(?:[^/]+/)*events/[^/]+/queue-entries(?:/.*)?$""")`,
];

const chuckerSetup = `    ${applicationMarker}
    if (BuildConfig.DEBUG) {
      val chuckerCollector = ChuckerCollector(
        context = this,
        showNotification = true,
        retentionPeriod = RetentionManager.Period.ONE_HOUR,
      )
      val chuckerInterceptor = ChuckerInterceptor.Builder(this)
        .collector(chuckerCollector)
        .maxContentLength(250_000L)
        .redactHeaders(
          "Authorization",
          "Cookie",
          "Set-Cookie",
          "Idempotency-Key",
          "X-Visitor-Token",
        )
${sensitivePathRegexes.map((regex) => `        .skipPaths(${regex})`).join("\n")}
        .build()

      OkHttpClientProvider.setOkHttpClientFactory {
        OkHttpClientProvider.createClientBuilder()
          .addNetworkInterceptor(chuckerInterceptor)
          .build()
      }
    }
`;

module.exports = (config) => {
  config = withAppBuildGradle(config, (result) => {
    const contents = result.modResults.contents;
    if (contents.includes(gradleMarker)) {
      result.modResults.contents = contents;
      return result;
    }

    const dependencyAnchor = /dependencies\s*\{/;
    if (!dependencyAnchor.test(contents)) {
      throw new Error(
        "Android app dependencies block not found; review the Chucker config plugin.",
      );
    }

    const dependencies = `\n    ${gradleMarker}\n    debugImplementation("com.github.chuckerteam.chucker:library:4.1.0")\n    releaseImplementation("com.github.chuckerteam.chucker:library-no-op:4.1.0")`;
    result.modResults.contents = contents.replace(
      dependencyAnchor,
      (match) => `${match}${dependencies}`,
    );
    return result;
  });

  return withMainApplication(config, (result) => {
    if (result.modResults.language !== "kt") {
      throw new Error(
        "Chucker config plugin expects the generated Kotlin MainApplication.",
      );
    }

    let contents = result.modResults.contents;

    const importAnchor = "import com.facebook.soloader.SoLoader";
    if (!contents.includes(importAnchor)) {
      throw new Error(
        "MainApplication SoLoader import not found; review the Chucker config plugin.",
      );
    }

    const chuckerImports = [
      "import com.chuckerteam.chucker.api.ChuckerCollector",
      "import com.chuckerteam.chucker.api.ChuckerInterceptor",
      "import com.chuckerteam.chucker.api.RetentionManager",
      "import com.facebook.react.modules.network.OkHttpClientProvider",
    ];
    contents = contents
      .split(/\r?\n/)
      .filter((line) => !chuckerImports.includes(line.trim()))
      .join("\n");
    contents = contents.replace(
      importAnchor,
      `${importAnchor}\n\n${chuckerImports.join("\n")}`,
    );

    if (!contents.includes(applicationMarker)) {
      const onCreateAnchor = "    super.onCreate()";
      if (!contents.includes(onCreateAnchor)) {
        throw new Error(
          "MainApplication onCreate anchor not found; review the Chucker config plugin.",
        );
      }
      contents = contents.replace(
        onCreateAnchor,
        `${onCreateAnchor}\n${chuckerSetup.trimEnd()}`,
      );
    }

    result.modResults.contents = contents;
    return result;
  });
};
