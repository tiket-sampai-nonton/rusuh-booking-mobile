const fs = require("node:fs");
const path = require("node:path");

const distDirectory = path.resolve(
  process.env.RBT_WEB_OUTPUT_DIR || path.join(__dirname, "..", "dist"),
);
const outputDirectory = path.join(distDirectory, ".well-known");
const androidFingerprint = process.env.ANDROID_CERT_SHA256_FINGERPRINT;
const appleTeamId = process.env.APPLE_TEAM_ID;
const appId = "com.tiketsampainonton.rusuhbooking";
let wroteAssociation = false;

fs.mkdirSync(outputDirectory, { recursive: true });

if (androidFingerprint) {
  const fingerprints = androidFingerprint
    .split(",")
    .map((fingerprint) => fingerprint.trim().toUpperCase());
  if (
    fingerprints.some(
      (fingerprint) => !/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(fingerprint),
    )
  ) {
    throw new Error(
      "ANDROID_CERT_SHA256_FINGERPRINT must be comma-separated SHA-256 fingerprints.",
    );
  }
  fs.writeFileSync(
    path.join(outputDirectory, "assetlinks.json"),
    `${JSON.stringify(
      [
        {
          relation: ["delegate_permission/common.handle_all_urls"],
          target: {
            namespace: "android_app",
            package_name: appId,
            sha256_cert_fingerprints: fingerprints,
          },
        },
      ],
      null,
      2,
    )}\n`,
  );
  wroteAssociation = true;
} else {
  process.stdout.write(
    "::warning::ANDROID_CERT_SHA256_FINGERPRINT is not configured; Android verified links will stay in the browser until it is added.\n",
  );
}

if (appleTeamId) {
  if (!/^[A-Z0-9]{10}$/i.test(appleTeamId)) {
    throw new Error(
      "APPLE_TEAM_ID must be the 10-character Apple Developer Team ID.",
    );
  }
  fs.writeFileSync(
    path.join(outputDirectory, "apple-app-site-association"),
    `${JSON.stringify(
      {
        applinks: {
          apps: [],
          details: [
            {
              appID: `${appleTeamId}.${appId}`,
              components: [{ "/": "/events/*" }],
            },
          ],
        },
      },
      null,
      2,
    )}\n`,
  );
  wroteAssociation = true;
} else {
  process.stdout.write(
    "::warning::APPLE_TEAM_ID is not configured; iOS Universal Links will stay in the browser until it is added.\n",
  );
}

if (wroteAssociation) {
  fs.writeFileSync(
    path.join(distDirectory, "_headers"),
    [
      "/.well-known/apple-app-site-association",
      "  Content-Type: application/json",
      "",
      "/.well-known/assetlinks.json",
      "  Content-Type: application/json",
      "",
    ].join("\n"),
  );
  process.stdout.write(
    `Wrote web-to-app association files in ${outputDirectory}.\n`,
  );
}
