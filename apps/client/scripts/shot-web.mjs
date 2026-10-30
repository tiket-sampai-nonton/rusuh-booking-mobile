// Dev-only screenshot helper: serve a built dist/ on 127.0.0.1 and capture a
// PNG of one route with Playwright chromium. NOT shipped — evidence tooling.
//
// Usage: node scripts/shot-web.mjs <route> <outfile> [waitMs]
//   route   e.g. "/" or "/events/evt-1"
//   outfile absolute path to the PNG to write
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { chromium } from "playwright";

const DIST = join(process.cwd(), "dist");
const ROUTE = process.argv[2] ?? "/";
const OUT = process.argv[3];
const WAIT = Number(process.argv[4] ?? 1500);
// Optional 5th arg: a JSON array of click steps to run AFTER loading ROUTE,
// e.g. '[{"text":"Rusuh Fest 2026"},{"testid":"join-cta"}]'. Each step clicks
// the element and waits WAIT ms. This drives the SPA through its client router
// (the reliable way to reach a dynamic route — a hard deep-link load of a
// dynamic path in the static SPA export is a separate SEO concern, RBT-033).
const STEPS = process.argv[5] ? JSON.parse(process.argv[5]) : [];

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".map": "application/json",
};

async function tryFile(p) {
  try {
    const s = await stat(p);
    if (s.isFile()) return p;
  } catch {
    /* not a file */
  }
  return null;
}

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
    let file =
      (await tryFile(join(DIST, urlPath))) ??
      (await tryFile(join(DIST, urlPath + ".html"))) ??
      (await tryFile(join(DIST, urlPath, "index.html")));
    // SPA fallback: Expo static export serves index.html for unknown routes.
    if (!file) file = await tryFile(join(DIST, "index.html"));
    if (!file) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file)] ?? "text/plain" });
    res.end(body);
  } catch (e) {
    res.writeHead(500);
    res.end(String(e));
  }
});

await new Promise((r) => server.listen(0, "127.0.0.1", r));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(base + ROUTE, { waitUntil: "networkidle" });
await page.waitForTimeout(WAIT);

for (const step of STEPS) {
  if (step.wait) {
    // A pure wait step (no click) — e.g. let an adaptive poll drain the queue.
    await page.waitForTimeout(step.wait);
    continue;
  }
  if (step.text) {
    await page.getByText(step.text, { exact: false }).first().click();
  } else if (step.testid) {
    await page.locator(`[data-testid="${step.testid}"]`).first().click();
  }
  await page.waitForTimeout(step.after ?? WAIT);
}

await page.screenshot({ path: OUT, fullPage: true });

await browser.close();
server.close();

if (errors.length) {
  console.error("PAGE ERRORS:\n" + errors.join("\n"));
  process.exit(2);
}
console.log(`OK ${ROUTE} -> ${OUT} (served ${base})`);
