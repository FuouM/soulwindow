// Runtime tests: node --test test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { createColorKit } from "../runtime/color-kit.js";
import { bootScript } from "../runtime/boot.js";
import { seg7Html } from "../runtime/seg7.js";
import { isPointOver } from "../runtime/drop.js";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const kit = createColorKit();

test("resolveHex accepts presets, short and long hex, and falls back to the default", () => {
  assert.equal(kit.resolveHex("pink"), "#ec4899");
  assert.equal(kit.resolveHex("#abc"), "#aabbcc");
  assert.equal(kit.resolveHex("ABCDEF"), "#abcdef");
  assert.equal(kit.resolveHex("nonsense"), "#0078d4");
  assert.equal(kit.resolveHex(null), "#0078d4");
});

test("accentPalette covers the same keys for every theme family", () => {
  const keys = Object.keys(kit.accentPalette("teal", "light")).sort();
  for (const f of ["dark", "high-contrast"]) {
    assert.deepEqual(Object.keys(kit.accentPalette("teal", f)).sort(), keys);
  }
  assert.equal(kit.accentPalette("#ffffff", "light")["--sys-highlight-text"], "#000000");
});

test("the boot script is self-contained and applies saved theme and accent", () => {
  const set = {};
  const attrs = {};
  const root = { setAttribute: (k, v) => (attrs[k] = v), style: { setProperty: (k, v) => (set[k] = v) } };
  const store = { "x-theme": JSON.stringify("dark"), "x-accent-color": JSON.stringify("pink") };
  const window = { localStorage: { getItem: (k) => store[k] ?? null }, matchMedia: () => ({ matches: false }) };
  const document = { documentElement: root, getElementById: () => null };
  new Function("window", "document", bootScript({ storagePrefix: "x-", density: "compact" }))(window, document);
  assert.equal(attrs["data-theme"], "dark");
  assert.equal(attrs["data-density"], "compact");
  assert.equal(root.style.colorScheme, "dark");
  assert.equal(set["--sys-accent"], "#ec4899");
});

test("seg7Html draws digits and escapes text", () => {
  const html = seg7Html("1:<");
  assert.match(html, /daw-seg7-narrow/);
  assert.match(html, /&lt;/);
  assert.equal((html.match(/<polygon/g) ?? []).length, 7);
});

test("isPointOver hit-tests physical or CSS pixels against an element and its children", () => {
  const child = {};
  const el = { contains: (n) => n === child };
  const calls = [];
  globalThis.window = { devicePixelRatio: 2 };
  globalThis.document = { elementFromPoint: (x, y) => (calls.push([x, y]), x < 50 ? child : {}) };
  try {
    assert.equal(isPointOver(el, { x: 80, y: 40 }), true);
    assert.deepEqual(calls[0], [40, 20]);
    assert.equal(isPointOver(el, { x: 80, y: 40 }, false), false);
    assert.equal(isPointOver(el, undefined), false);
  } finally {
    delete globalThis.window;
    delete globalThis.document;
  }
});

test("CSS has no hex colours outside the token and theme files", () => {
  const offenders = [];
  const allowed = /^(tokens\.css|themes\/.*|pro\/daw\.css)$/; // daw.css: the always-dark VFD glass only
  const walk = (dir, rel = "") => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const r = rel + e.name;
      if (e.isDirectory()) walk(`${dir}/${e.name}`, r + "/");
      else if (r.endsWith(".css") && !allowed.test(r)) {
        readFileSync(`${dir}/${e.name}`, "utf8").split("\n").forEach((line, i) => {
          if (/#[0-9a-f]{3,8}\b/i.test(line) && !/^\s*(\/\*|\*)/.test(line)) offenders.push(`${r}:${i + 1}: ${line.trim()}`);
        });
      }
    }
  };
  walk(fileURLToPath(new URL("../css", import.meta.url)));
  assert.deepEqual(offenders, []);
});
