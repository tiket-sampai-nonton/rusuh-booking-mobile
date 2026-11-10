/* Generate deployment-specific robots and sitemap files after Expo export. */
const fs = require("node:fs");
const path = require("node:path");

const dist = path.resolve(__dirname, "../dist");
const rawSiteUrl = process.env.EXPO_PUBLIC_SITE_URL;

if (!rawSiteUrl) {
  throw new Error("EXPO_PUBLIC_SITE_URL is required to generate SEO metadata.");
}

const site = new URL(rawSiteUrl);
if (
  site.protocol !== "https:" ||
  site.pathname !== "/" ||
  site.search ||
  site.hash
) {
  throw new Error(
    "EXPO_PUBLIC_SITE_URL must be an HTTPS origin without a path.",
  );
}

const robotsPath = path.join(dist, "robots.txt");
const eventDir = path.join(dist, "events");
if (!fs.existsSync(robotsPath))
  throw new Error("Expo export is missing robots.txt.");
if (!fs.existsSync(eventDir))
  throw new Error("Expo export is missing event routes.");

const eventPages = fs
  .readdirSync(eventDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
  .map((entry) => entry.name)
  .filter((name) => !/[\[\]]/.test(name))
  .sort();
if (!eventPages.length)
  throw new Error("Expo export has no generated event detail pages.");

const publicPaths = [
  "/",
  "/browse",
  "/history",
  "/privacy",
  ...eventPages.map((name) => `/events/${name.slice(0, -5)}`),
];
const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...publicPaths.map(
    (route) =>
      `  <url><loc>${escapeXml(new URL(route, site).href)}</loc></url>`,
  ),
  "</urlset>",
  "",
].join("\n");

const robots = fs
  .readFileSync(robotsPath, "utf8")
  .split(/\r?\n/)
  .filter((line) => !/^\s*Sitemap:/i.test(line))
  .join("\n")
  .trimEnd();

fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);
fs.writeFileSync(
  robotsPath,
  `${robots}\n\nSitemap: ${new URL("/sitemap.xml", site).href}\n`,
);
console.log(
  `Generated sitemap for ${publicPaths.length} public routes at ${site.origin}.`,
);
