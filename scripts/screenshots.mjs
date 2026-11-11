// Screenshots of the built showcase in every theme × density (and one accent), for review and
// before/after comparison. Usage: npm run build:showcase && npm run screenshots
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

// Playwright is not a dependency: use the one installed on the machine (require works from anywhere).
const { chromium } = createRequire(import.meta.url)("playwright");
const root = resolve("showcase/dist");
const out = resolve(process.argv[2] ?? "screenshots");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".woff": "font/woff", ".svg": "image/svg+xml" };
const server = createServer(async (req, res) => {
  try {
    const path = join(root, decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/\/$/, "/index.html"));
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
    res.end(await readFile(path));
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const base = `http://localhost:${server.address().port}/`;

const cases = [
  ["light", "comfortable", null, { width: 1280, height: 900 }],
  ["dark", "comfortable", null, { width: 1280, height: 900 }],
  ["high-contrast", "comfortable", null, { width: 1280, height: 900 }],
  ["windows7", "comfortable", null, { width: 1280, height: 900 }],
  ["dark", "comfortable", "pink", { width: 1280, height: 900 }],
  ["light", "touch", null, { width: 390, height: 844 }],
  ["dark", "touch", null, { width: 390, height: 844 }],
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const errors = [];
for (const [theme, density, accent, viewport] of cases) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => errors.push(`${theme}/${density}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${theme}/${density}: ${m.text()}`));
  const q = new URLSearchParams({ theme, density, ...(accent ? { accent } : { accent: "default" }) });
  await page.goto(base + "?" + q);
  await page.waitForTimeout(400);
  const name = [theme, density, accent].filter(Boolean).join("-");
  await page.screenshot({ path: join(out, `${name}.png`), fullPage: true });
  if (density === "touch") {
    await page.getByRole("button", { name: "Open dialog" }).click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: join(out, `${name}-dialog.png`) });
  }
  await page.close();
}
await browser.close();
server.close();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`wrote ${cases.length} screenshots to ${out}`);
