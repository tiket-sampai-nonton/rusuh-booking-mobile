/* Verify static SEO output and initial-JavaScript budgets before deployment. */
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const root = path.resolve(__dirname, "../dist");
const siteUrl = process.env.EXPO_PUBLIC_SITE_URL;
const errors = [];

function read(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    errors.push(`Missing artifact: ${file}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function requirePattern(html, pattern, description) {
  if (!pattern.test(html)) errors.push(`Missing ${description}`);
}

function assertCanonical(html, file) {
  const route = file === "index.html" ? "/" : `/${file.replace(/\.html$/, "")}`;
  const canonical = html.match(
    /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/i,
  );
  const expected = new URL(route, siteUrl).href;
  if (!canonical || canonical[1] !== expected) {
    errors.push(`${file}: canonical URL should be ${expected}`);
  }
}

function checkHtml(
  file,
  budget,
  { publicPage = false, eventPage = false } = {},
) {
  const html = read(file);
  if (!html) return;

  requirePattern(html, /<title\b[^>]*>[^<]+<\/title>/i, `${file}: title`);
  requirePattern(
    html,
    /<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["'][^"']+)[^>]*>/i,
    `${file}: description`,
  );
  requirePattern(
    html,
    /<meta\b(?=[^>]*\bproperty=["']og:title["'])(?=[^>]*\bcontent=["'][^"']+)[^>]*>/i,
    `${file}: Open Graph title`,
  );
  requirePattern(
    html,
    /<meta\b(?=[^>]*\bproperty=["']og:description["'])(?=[^>]*\bcontent=["'][^"']+)[^>]*>/i,
    `${file}: Open Graph description`,
  );
  requirePattern(
    html,
    /<meta\b(?=[^>]*\bproperty=["']og:url["'])(?=[^>]*\bcontent=["'][^"']+)[^>]*>/i,
    `${file}: Open Graph URL`,
  );
  requirePattern(
    html,
    /<meta\b(?=[^>]*\bproperty=["']og:image["'])(?=[^>]*\bcontent=["'][^"']+)[^>]*>/i,
    `${file}: Open Graph image`,
  );
  if (publicPage) assertCanonical(html, file);

  const noindex =
    /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*noindex)[^>]*>/i.test(
      html,
    );
  if (publicPage && noindex)
    errors.push(`${file}: public base route is noindex`);
  if (!publicPage && !noindex)
    errors.push(`${file}: transactional route is not noindex`);

  if (eventPage) {
    const jsonLd = html.match(
      /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/i,
    );
    if (!jsonLd) {
      errors.push(`${file}: Event JSON-LD is missing`);
    } else {
      try {
        const data = JSON.parse(jsonLd[1]);
        if (
          data["@type"] !== "Event" ||
          !data.name ||
          !data.startDate ||
          !data.url
        ) {
          errors.push(
            `${file}: Event JSON-LD is missing name, startDate, or URL`,
          );
        }
      } catch {
        errors.push(`${file}: Event JSON-LD is not valid JSON`);
      }
    }
  }

  const scriptUrls = [
    ...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+\.js(?:\?[^"']*)?)["']/gi),
  ].map((match) => match[1]);
  if (!scriptUrls.length) {
    errors.push(`${file}: no initial JavaScript found`);
    return;
  }

  let totalGzipBytes = 0;
  const assets = new Set();
  for (const src of scriptUrls) {
    let assetUrl;
    try {
      assetUrl = new URL(src, `https://artifact.invalid/${file}`);
    } catch {
      errors.push(`${file}: invalid JavaScript URL ${src}`);
      continue;
    }
    if (assetUrl.origin !== "https://artifact.invalid") {
      errors.push(`${file}: external script cannot be checked: ${src}`);
      continue;
    }
    const asset = path.resolve(
      root,
      `.${decodeURIComponent(assetUrl.pathname)}`,
    );
    if (!asset.startsWith(root + path.sep)) {
      errors.push(`${file}: invalid asset path ${src}`);
      continue;
    }
    if (assets.has(asset)) continue;
    assets.add(asset);
    try {
      totalGzipBytes += zlib.gzipSync(fs.readFileSync(asset)).length;
    } catch {
      errors.push(`${file}: missing JavaScript ${src}`);
    }
  }
  if (totalGzipBytes > budget) {
    errors.push(
      `${file}: initial JavaScript ${totalGzipBytes} bytes gzip exceeds ${budget} bytes`,
    );
  }
}

if (!siteUrl)
  errors.push("EXPO_PUBLIC_SITE_URL is required for artifact verification");
const appConfig = fs.readFileSync(
  path.resolve(__dirname, "../app.config.js"),
  "utf8",
);
if (!/output\s*:\s*["']static["']/.test(appConfig)) {
  errors.push('app.config.js must set web.output to "static"');
}

const maxInitialJsGzipBytes = 1_000_000;

for (const file of ["index.html", "browse.html", "history.html"]) {
  checkHtml(file, maxInitialJsGzipBytes, { publicPage: true });
}

const eventsDir = path.join(root, "events");
const eventFiles = fs.existsSync(eventsDir)
  ? fs
      .readdirSync(eventsDir)
      .filter((file) => file.endsWith(".html") && !/[\[\]]/.test(file))
      .sort()
  : [];
if (!eventFiles.length) {
  errors.push("No real event-ID HTML routes were generated");
}
for (const eventFile of eventFiles) {
  const file = `events/${eventFile}`;
  checkHtml(file, maxInitialJsGzipBytes, {
    publicPage: true,
    eventPage: true,
  });
  const html = read(file);
  if (/<title\b[^>]*>Detail Event\s*·/i.test(html)) {
    errors.push(`${file}: event title is still generic`);
  }
}

const transactionSegments = new Set([
  "checkout",
  "payment",
  "payment-result",
  "payment-webview",
  "snap",
  "success",
  "waiting",
  "expired",
  "failed",
]);
function walkHtml(dir, relative = "") {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const nextRelative = path.join(relative, entry.name);
    if (entry.isDirectory())
      return walkHtml(path.join(dir, entry.name), nextRelative);
    if (!entry.isFile() || !entry.name.endsWith(".html")) return [];
    return [nextRelative.split(path.sep).join("/")];
  });
}
const transactionalFiles = walkHtml(root).filter((file) =>
  file
    .split("/")
    .some((segment) =>
      transactionSegments.has(segment.replace(/^\(|\)$/g, "")),
    ),
);
if (!transactionalFiles.length)
  errors.push("No transactional HTML route artifacts were generated");
for (const file of transactionalFiles) checkHtml(file, maxInitialJsGzipBytes);

const robots = read("robots.txt");
requirePattern(robots, /User-agent:\s*\*/i, "robots.txt user-agent rule");
requirePattern(
  robots,
  new RegExp(
    `Sitemap:\\s*${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/sitemap\\.xml`,
    "i",
  ),
  "robots.txt sitemap URL",
);

const sitemap = read("sitemap.xml");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => match[1],
);
if (!sitemapUrls.length)
  errors.push("sitemap.xml contains no public route URLs");
const expectedSitemapUrls = [
  new URL("/", siteUrl).href,
  new URL("/browse", siteUrl).href,
  new URL("/history", siteUrl).href,
  ...eventFiles.map(
    (file) => new URL(`/events/${file.slice(0, -5)}`, siteUrl).href,
  ),
];
for (const url of expectedSitemapUrls) {
  if (!sitemapUrls.includes(url)) errors.push(`sitemap.xml is missing ${url}`);
}
if (
  sitemapUrls.some(
    (url) => !url.startsWith(`${siteUrl}/`) && url !== `${siteUrl}/`,
  )
) {
  errors.push("sitemap.xml includes a URL outside EXPO_PUBLIC_SITE_URL");
}
if (sitemapUrls.some((url) => /\?|\[|\]/.test(url))) {
  errors.push(
    "sitemap.xml must not include query results or placeholder routes",
  );
}

if (errors.length) {
  console.error(`Web artifact verification failed:\n- ${errors.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(
    `Web artifact verification passed: ${3 + eventFiles.length} public routes, ` +
      `${transactionalFiles.length} transactional routes, SEO files, and gzip budgets.`,
  );
}
