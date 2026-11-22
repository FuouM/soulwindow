// Runtime tests: node --test test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { createColorKit } from "../runtime/color-kit.js";
import { bootScript } from "../runtime/boot.js";
import { seg7Html, seg7Set } from "../runtime/seg7.js";
import { isPointOver } from "../runtime/drop.js";
import { seekBar } from "../vanilla/index.js";
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

/** A fake readout container: innerHTML parses the seg7Html cells into fake elements (all seg7Set reads and writes). */
function fakeReadout() {
  return {
    writes: 0,
    firstElementChild: null,
    set innerHTML(html) {
      this.writes++;
      const attr = (k) => (new RegExp(`${k}="([^"]*)"`).exec(html) ?? [])[1];
      const cells = [...html.matchAll(/<svg class="daw-seg7"[^>]*>(.*?)<\/svg>|<svg class="daw-seg7 daw-seg7-narrow".*?<\/svg>|<span class="daw-seg7-text">(.*?)<\/span>/g)].map((m) => {
        if (m[2] !== undefined) return { textContent: m[2] };
        const polys = [...(m[1] ?? "").matchAll(/<polygon[^>]*?(class="daw-seg7-on")?\/>/g)].map((p) => {
          const on = new Set(p[1] ? ["daw-seg7-on"] : []);
          return { classList: { toggle: (c, f) => (f ? on.add(c) : on.delete(c)), contains: (c) => on.has(c) } };
        });
        return { children: polys };
      });
      const a = { "data-seg7": attr("data-seg7"), "aria-label": attr("aria-label") };
      this.firstElementChild = { className: attr("class"), children: cells, getAttribute: (k) => a[k], setAttribute: (k, v) => (a[k] = v) };
    },
  };
}
const litOf = (cell) => cell.children.map((p) => (p.classList.contains("daw-seg7-on") ? 1 : 0)).join("");

test("seg7Set switches segments in place and rebuilds only when the cells change", () => {
  const el = fakeReadout();
  seg7Set(el, "01:2");
  assert.equal(el.writes, 1);
  const row = el.firstElementChild;
  seg7Set(el, "18:8");
  assert.equal(el.writes, 1, "same cells: no new markup");
  assert.equal(el.firstElementChild, row);
  assert.equal(row.getAttribute("aria-label"), "18:8");
  assert.equal(litOf(row.children[0]), "0110000"); // 1: b c
  assert.equal(litOf(row.children[1]), "1111111"); // 8: all
  seg7Set(el, "18.8");
  assert.equal(el.writes, 2, "a colon became a dot: new markup");
  seg7Set(el, "18.8", "daw-lcd-amber");
  assert.equal(el.writes, 3, "another class: new markup");
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

// Just enough DOM for seekBar(): elements, attributes, classes, listeners, pointer capture.
class FakeEl {
  constructor(tag) {
    Object.assign(this, { tagName: tag, className: "", tabIndex: 0, textContent: "", parentNode: null, children: [], attrs: {}, style: {}, on: {}, captured: new Set() });
    this.classList = {
      toggle: (c, force) => {
        const s = new Set(this.className.split(" ").filter(Boolean));
        if (force) s.add(c);
        else s.delete(c);
        this.className = [...s].join(" ");
      },
      contains: (c) => this.className.split(" ").includes(c),
    };
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  removeAttribute(k) { delete this.attrs[k]; }
  appendChild(c) { return this.insertBefore(c, null); }
  insertBefore(c, ref) {
    const i = ref ? this.children.indexOf(ref) : -1;
    if (i < 0) this.children.push(c);
    else this.children.splice(i, 0, c);
    c.parentNode = this;
    return c;
  }
  removeChild(c) { this.children.splice(this.children.indexOf(c), 1); c.parentNode = null; return c; }
  addEventListener(t, f) { (this.on[t] ??= []).push(f); }
  fire(t, ev = {}) {
    const e = { prevented: false, preventDefault() { this.prevented = true; }, stopPropagation() {}, ...ev };
    for (const f of this.on[t] ?? []) f(e);
    return e;
  }
  focus() {}
  getBoundingClientRect() { return { left: 0, width: 100 }; }
  setPointerCapture(id) { this.captured.add(id); }
  releasePointerCapture(id) { this.captured.delete(id); }
  hasPointerCapture(id) { return this.captured.has(id); }
}

function withDom(fn) {
  globalThis.document = { createElement: (t) => new FakeEl(t), createTextNode: (t) => ({ t }) };
  try { fn(); } finally { delete globalThis.document; }
}

test("seekBar keys step, jump and clamp to 0..max, and the bar follows without set()", () => withDom(() => {
  const got = [];
  const bar = seekBar({ max: 10, value: 9, ariaLabel: "Seek", onInput: (v) => got.push(v) });
  const fill = bar.children[0];
  assert.equal(bar.fire("keydown", { key: "ArrowRight" }).prevented, true);
  assert.equal(bar.fire("keydown", { key: "ArrowUp" }).prevented, true); // already at max: no event
  bar.fire("keydown", { key: "PageDown" });
  bar.fire("keydown", { key: "PageDown" });
  bar.fire("keydown", { key: "End" });
  bar.fire("keydown", { key: "Home" });
  assert.equal(bar.fire("keydown", { key: "a" }).prevented, false);
  assert.deepEqual(got, [10, 0, 10, 0]);
  assert.equal(fill.style.width, "0%");
  assert.equal(bar.attrs["aria-valuenow"], "0");
  bar.set(25);
  assert.equal(bar.attrs["aria-valuenow"], "10");
}));

test("seekBar is inert when disabled or max is 0", () => withDom(() => {
  const got = [];
  const bar = seekBar({ max: 0, onInput: (v) => got.push(v) });
  assert.equal(bar.tabIndex, -1);
  assert.equal(bar.attrs["aria-disabled"], "true");
  bar.fire("keydown", { key: "End" });
  bar.setMax(5);
  assert.equal(bar.tabIndex, 0);
  assert.equal(bar.attrs["aria-disabled"], undefined);
  bar.setDisabled(true);
  bar.fire("pointerdown", { button: 0, pointerId: 1, clientX: 50 });
  assert.deepEqual(got, []);
}));

test("seekBar drags with pointer capture, places marks and shows the tip", () => withDom(() => {
  const log = [];
  const bar = seekBar({
    max: 10,
    marks: [{ value: 5, title: "Key" }],
    format: (v) => `F${v}`,
    onInput: (v) => log.push(v),
    onScrubStart: () => log.push("start"),
    onScrubEnd: () => log.push("end"),
  });
  const mark = bar.children.find((c) => c.className === "daw-seek-mark");
  assert.equal(mark.style.left, "50%");
  assert.equal(mark.attrs.title, "Key");
  bar.fire("pointerdown", { button: 0, pointerId: 1, clientX: 30 });
  assert.equal(bar.classList.contains("is-dragging"), true);
  bar.fire("pointermove", { pointerId: 1, clientX: 140 });
  const tip = bar.children.find((c) => c.className === "daw-seek-tip");
  assert.equal(tip.textContent, "F10");
  assert.equal(tip.style.left, "94%");
  bar.fire("pointerup", { pointerId: 1 });
  assert.deepEqual(log, ["start", 3, 10, "end"]);
  assert.equal(bar.classList.contains("is-dragging"), false);
  bar.setMax(20);
  assert.equal(mark.style.left, "25%");
  bar.fire("pointerleave");
  assert.equal(tip.parentNode, null);
}));

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
