// Regenerates the README images in docs/images/ from the built showcase.
//   npm run build:showcase && npm run readme-images
// Pieces are captured at 2x, then laid out side by side in a throwaway page and captured again.
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const { chromium } = createRequire(import.meta.url)("playwright");
const root = resolve("showcase/dist");
const out = resolve("docs/images");
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
await mkdir(out, { recursive: true });
const browser = await chromium.launch();

async function open(query, viewport = { width: 1280, height: 900 }) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  await page.goto(base + "?" + new URLSearchParams({ accent: "default", density: "comfortable", ...query }));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  return page;
}

/** Union of the boxes of the first `n` elements matching `selector`, padded. */
async function clipOf(page, selector, n = 1, pad = 12) {
  const boxes = await page.locator(selector).evaluateAll(
    (els, n) => els.slice(0, n).map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top + scrollY, r.right, r.bottom + scrollY]; }),
    n,
  );
  const x = Math.min(...boxes.map((b) => b[0])) - pad;
  const y = Math.min(...boxes.map((b) => b[1])) - pad;
  return { x: Math.max(0, x), y: Math.max(0, y), width: Math.max(...boxes.map((b) => b[2])) - x + pad, height: Math.max(...boxes.map((b) => b[3])) - y + pad };
}

async function shot(query, clip, viewport) {
  const page = await open(query, viewport);
  const buf = await page.screenshot(typeof clip === "function" ? { clip: await clip(page), fullPage: true } : clip ? { clip, fullPage: true } : {});
  await page.close();
  return "data:image/png;base64," + buf.toString("base64");
}

/** Lays captured images out with captions and saves the result. */
async function compose(name, columns, items, width) {
  const page = await browser.newPage({ viewport: { width, height: 400 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><style>
    body { margin: 0; background: #d9dce1; font: 600 26px "Segoe UI", system-ui, sans-serif; color: #1b1f24; }
    .g { display: grid; grid-template-columns: repeat(${columns}, auto); gap: 28px; padding: 28px; justify-content: start; width: max-content; }
    figure { margin: 0; display: flex; flex-direction: column; gap: 10px; }
    img { display: block; border: 2px solid #8a9099; }
  </style><div class="g">${items.map(([cap, src]) => `<figure><figcaption>${cap}</figcaption><img src="${src}"></figure>`).join("")}</div>`);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
  await page.locator(".g").screenshot({ path: join(out, name) });
  await page.close();
  console.log("wrote", name);
}

async function save(name, src) {
  const page = await browser.newPage();
  const { writeFile } = await import("node:fs/promises");
  await writeFile(join(out, name), Buffer.from(src.split(",")[1], "base64"));
  await page.close();
  console.log("wrote", name);
}

// 1. Hero: dark theme, desktop, top of the page.
await save("hero.png", await shot({ theme: "dark" }, { x: 0, y: 0, width: 1280, height: 490 }));

// 2. Themes: the first row of controls in each theme.
const row = (p) => clipOf(p, ".sc-grid > .group-box", 3);
await compose(
  "themes.png",
  1,
  [
    ["Light", await shot({ theme: "light" }, row)],
    ["Dark", await shot({ theme: "dark" }, row)],
    ["High contrast", await shot({ theme: "high-contrast" }, row)],
  ],
  1400,
);

// 3. Accents: one accent colour drives primary, selection, focus and links.
const buttons = (p) => clipOf(p, ".sc-grid > .group-box", 2);
await compose(
  "accents.png",
  2,
  [
    ["Pink, light", await shot({ theme: "light", accent: "pink" }, buttons)],
    ["Green, dark", await shot({ theme: "dark", accent: "green" }, buttons)],
    ["Amber, light", await shot({ theme: "light", accent: "amber" }, buttons)],
    ["Purple, dark", await shot({ theme: "dark", accent: "purple" }, buttons)],
  ],
  1600,
);

// 4. The pro layer (DAW / NLE editor chrome), dark and light.
const daw = (p) => clipOf(p, ".sc-daw", 1, 0);
await save("editor-dark.png", await shot({ theme: "dark" }, daw));
await save("editor-light.png", await shot({ theme: "light" }, daw));

// 5. Touch density on a phone: page and dialog-as-sheet.
const phone = { width: 390, height: 760 };
const dialog = async (query) => {
  const page = await open(query, phone);
  await page.getByRole("button", { name: "Open dialog" }).click();
  await page.waitForTimeout(250);
  const buf = await page.screenshot();
  await page.close();
  return "data:image/png;base64," + buf.toString("base64");
};
await compose(
  "mobile.png",
  3,
  [
    ["Touch, light", await shot({ theme: "light", density: "touch" }, null, phone)],
    ["Touch, dark", await shot({ theme: "dark", density: "touch", accent: "teal" }, null, phone)],
    ["Dialog becomes a sheet", await dialog({ theme: "dark", density: "touch", accent: "teal" })],
  ],
  2600,
);

await browser.close();
server.close();
