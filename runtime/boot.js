// SoulWindow runtime — boot.js: the synchronous pre-paint <head> script.
// It applies the saved theme, accent and density before first paint, so there is no light flash in
// dark mode. Use the Vite plugin (soulwindow/vite) or paste bootScript(options) into a <script> in <head>.
import { createColorKit } from "./color-kit.js";
import { resolveOptions } from "./config.js";

/* Serialised into the page: must only use its arguments and browser globals. */
function bootMain(createKit, cfg) {
  try {
    var root = document.documentElement;
    var read = function (key) {
      try {
        var raw = window.localStorage.getItem(cfg.storagePrefix + key);
        if (raw == null) return null;
        try {
          return JSON.parse(raw);
        } catch (_) {
          return raw.replace(/^["']|["']$/g, "").trim().toLowerCase();
        }
      } catch (_) {
        return null;
      }
    };
    var mq = function (q) {
      return !!(window.matchMedia && window.matchMedia(q).matches);
    };
    var theme = read("theme");
    if (typeof theme !== "string" || !cfg.themes[theme]) {
      theme = cfg.defaultTheme !== "system" ? cfg.defaultTheme : mq("(prefers-color-scheme: dark)") && cfg.themes.dark ? "dark" : "light";
    }
    var t = cfg.themes[theme] || cfg.themes[Object.keys(cfg.themes)[0]];
    var dark = t.family === "dark" || t.family === "high-contrast";
    root.setAttribute("data-theme", theme);
    root.style.backgroundColor = t.bg;
    root.style.color = t.text;
    root.style.colorScheme = dark ? "dark" : "light";
    var meta = document.getElementById(cfg.metaId);
    if (meta) meta.setAttribute("content", t.meta);
    if (window.AndroidThemeBridge && window.AndroidThemeBridge.updateTheme) {
      try {
        window.AndroidThemeBridge.updateTheme(dark, t.meta);
      } catch (_) {}
    }
    var density = cfg.density === "auto" ? (mq("(pointer: coarse)") ? "touch" : "comfortable") : cfg.density;
    if (density && density !== "comfortable") root.setAttribute("data-density", density);
    var accent = read("accent-color");
    if (typeof accent === "string" && accent && accent !== "default") {
      var pal = createKit().accentPalette(accent, t.family);
      for (var k in pal) root.style.setProperty(k, pal[k]);
    }
  } catch (_) {}
}

/**
 * The boot script source for these options, ready for an inline <script> in <head>.
 * @param {import("./config").SoulWindowOptions} [options]
 */
export function bootScript(options) {
  var cfg = resolveOptions(options);
  var data = {
    storagePrefix: cfg.storagePrefix,
    themes: cfg.themes,
    defaultTheme: cfg.defaultTheme,
    density: cfg.density,
    metaId: cfg.metaId,
  };
  return "(" + bootMain.toString() + ")(" + createColorKit.toString() + "," + JSON.stringify(data) + ");";
}
