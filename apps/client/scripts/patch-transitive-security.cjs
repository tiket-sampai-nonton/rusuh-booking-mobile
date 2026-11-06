/**
 * Compatibility bridge for Metro 0.82.x and image-size 2.x.
 * Metro currently calls the v1 default export; v2 exposes `imageSize` as a
 * named export. Keep this narrow and fail closed if Metro changes its call site.
 */
const fs = require("node:fs");
const path = require("node:path");

const metroPackagePath = require.resolve("metro/package.json");
const metroPackage = require(metroPackagePath);
if (!/^0\.82\./.test(metroPackage.version)) {
  throw new Error(
    `Review the image-size compatibility patch for Metro ${metroPackage.version}`,
  );
}

const assetsPath = path.join(path.dirname(metroPackagePath), "src", "Assets.js");
const marker = "// RBT security compatibility: image-size 2.x";
const previousImport = 'const getImageSize = require("image-size");';
const replacementImport =
  `const { imageSize: getImageSize } = require("image-size");\n` +
  `const { imageSizeFromFile: getImageSizeFromFile } = require("image-size/fromFile");\n` +
  marker;
const previousCall =
  "  const dimensions = isImage ? getImageSize(isImageInput) : null;";
const replacementCall =
  "  const dimensions = isImage\n" +
  "    ? typeof isImageInput === \"string\"\n" +
  "      ? await getImageSizeFromFile(isImageInput)\n" +
  "      : getImageSize(isImageInput)\n" +
  "    : null;";
const contents = fs.readFileSync(assetsPath, "utf8");

if (contents.includes(marker)) process.exit(0);
if (!contents.includes(previousImport) || !contents.includes(previousCall)) {
  throw new Error(
    "Metro Assets.js image-size call site changed; review the security compatibility patch",
  );
}
fs.writeFileSync(
  assetsPath,
  contents
    .replace(previousImport, replacementImport)
    .replace(previousCall, replacementCall),
);
