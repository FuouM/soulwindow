// SoulWindow runtime — soulwindow.js: the live theme / accent / density controller. Framework-free;
// solid/ wraps it in signals, plain-TS apps call it directly.
import { createColorKit } from "./color-kit.js";
import { resolveOptions, DENSITIES } from "./config.js";

var kit = createColorKit();

/** @param {import("./config").SoulWindowOptions} [options] @returns {import("./soulwindow").SoulWindow} */
export function createSoulWindow(options) {
  var cfg = resolveOptions(options);
  var ids = Object.keys(cfg.themes);
  var listeners = new Set();
  var hasDom = typeof document !== "undefined";
  var root = hasDom ? document.documentElement : null;
  var guardTimer = null;

  function storageGet(key) {
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
  }
  function storageSet(key, value) {
    try {
      window.localStorage.setItem(cfg.storagePrefix + key, JSON.stringify(value));
    } catch (_) {}
  }
  function systemDark() {
    return !!(typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }
  function fallbackTheme() {
    if (cfg.defaultTheme !== "system") return cfg.defaultTheme;
    return systemDark() && cfg.themes.dark ? "dark" : cfg.themes.light ? "light" : ids[0];
  }

  var saved = storageGet("theme");
  var followSystem = !(typeof saved === "string" && cfg.themes[saved]);
  var state = {
    theme: followSystem ? fallbackTheme() : saved,
    accent: (function () {
      var a = storageGet("accent-color");
      return typeof a === "string" && a ? a.trim().toLowerCase() : "default";
    })(),
    density: (function () {
      var d = cfg.density;
      if (d === "auto") {
        d = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(pointer: coarse)").matches ? "touch" : "comfortable";
      }
      return d;
    })(),
  };

  function def() {
    return cfg.themes[state.theme];
  }
  function isDark() {
    var f = def().family;
    return f === "dark" || f === "high-contrast";
  }
  function emit() {
    var snap = { theme: state.theme, accent: state.accent, density: state.density };
    listeners.forEach(function (fn) {
      fn(snap);
    });
  }

  /* Turn transitions off for the frame the theme changes in, or every coloured element animates. */
  function guardTransitions() {
    if (!root) return;
    root.classList.add("ds-disable-transitions");
    void root.offsetHeight;
    if (guardTimer !== null) clearTimeout(guardTimer);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        guardTimer = setTimeout(function () {
          guardTimer = null;
          root.classList.remove("ds-disable-transitions");
        }, 150);
      });
    });
  }

  function applyAccent() {
    if (!root) return;
    var pal = kit.accentPalette(kit.DEFAULT_HEX, "light");
    if (state.accent === "default") {
      for (var k in pal) root.style.removeProperty(k);
      return;
    }
    pal = kit.accentPalette(state.accent, def().family);
    for (var key in pal) root.style.setProperty(key, pal[key]);
  }

  function applyTheme() {
    if (!root) return;
    var t = def();
    guardTransitions();
    // The boot script painted <html> inline; hand control back to the stylesheet.
    root.style.removeProperty("background-color");
    root.style.removeProperty("color");
    root.style.colorScheme = isDark() ? "dark" : "light";
    root.setAttribute("data-theme", state.theme);
    if (cfg.legacyClassPrefix && document.body) {
      var p = cfg.legacyClassPrefix;
      ids.forEach(function (id) {
        document.body.classList.remove(p + id);
      });
      document.body.classList.add(p + state.theme);
      document.body.classList.toggle(p + "dark", isDark());
    }
    var meta = document.getElementById(cfg.metaId);
    if (meta) meta.setAttribute("content", t.meta);
    if (window.AndroidThemeBridge && window.AndroidThemeBridge.updateTheme) {
      try {
        window.AndroidThemeBridge.updateTheme(isDark(), t.meta);
      } catch (_) {}
    }
    applyAccent();
  }

  function applyDensity() {
    if (!root) return;
    if (state.density === "comfortable") root.removeAttribute("data-density");
    else root.setAttribute("data-density", state.density);
  }

  if (hasDom) {
    applyTheme();
    applyDensity();
    if (window.matchMedia) {
      var mql = window.matchMedia("(prefers-color-scheme: dark)");
      var onSystem = function () {
        if (!followSystem) return;
        state.theme = fallbackTheme();
        applyTheme();
        emit();
      };
      if (mql.addEventListener) mql.addEventListener("change", onSystem);
    }
    // Keep several windows of the same app in step.
    window.addEventListener("storage", function (ev) {
      if (ev.key === cfg.storagePrefix + "theme" || ev.key === cfg.storagePrefix + "accent-color") {
        var th = storageGet("theme");
        var ac = storageGet("accent-color");
        if (typeof th === "string" && cfg.themes[th]) {
          state.theme = th;
          followSystem = false;
        }
        state.accent = typeof ac === "string" && ac ? ac : "default";
        applyTheme();
        emit();
      }
    });
  }

  return {
    kit: kit,
    themes: cfg.themes,
    theme: function () {
      return state.theme;
    },
    themeDef: def,
    isDark: isDark,
    setTheme: function (id) {
      if (!cfg.themes[id]) return;
      state.theme = id;
      followSystem = false;
      storageSet("theme", id);
      applyTheme();
      emit();
    },
    cycleTheme: function () {
      this.setTheme(ids[(ids.indexOf(state.theme) + 1) % ids.length]);
    },
    accent: function () {
      return state.accent;
    },
    setAccent: function (color) {
      state.accent = String(color || "default").trim().toLowerCase() || "default";
      storageSet("accent-color", state.accent);
      applyAccent();
      emit();
    },
    density: function () {
      return state.density;
    },
    setDensity: function (d) {
      if (DENSITIES.indexOf(d) < 0) return;
      state.density = d;
      applyDensity();
      emit();
    },
    subscribe: function (fn) {
      listeners.add(fn);
      return function () {
        listeners.delete(fn);
      };
    },
  };
}
