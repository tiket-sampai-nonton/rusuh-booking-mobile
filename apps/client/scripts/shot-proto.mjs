// Screenshot a prototype HTML page (the 1:1 visual target). Serves the
// prototype Final/ dir and captures one page. Evidence tooling only.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { chromium } from "playwright";

const PROTO = process.argv[2]; // absolute path to Final/
const PAGE = process.argv[3]; // e.g. index.html
const OUT = process.argv[4];
const WAIT = Number(process.argv[5] ?? 2500);

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg" };

const server = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent((req.url ?? "/").split("?")[0]);
    const file = join(PROTO, p === "/" ? "index.html" : p);
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file)] ?? "text/plain" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("nf");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const { port } = server.address();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`http://127.0.0.1:${port}/${PAGE}`, { waitUntil: "networkidle" });
await page.waitForTimeout(WAIT);
await page.screenshot({ path: OUT, fullPage: false });
await browser.close();
server.close();
console.log(`proto ${PAGE} -> ${OUT}`);
