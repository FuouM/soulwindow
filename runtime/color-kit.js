// SoulWindow runtime — color-kit.js
// The accent colour maths, as ONE self-contained factory. It must not reference anything outside its
// own body: boot.js serialises it with Function.prototype.toString() into the pre-paint <head> script,
// and the live runtime calls the same function. One source, so the head script and the theme switcher
// can never drift apart again.

/** @returns {import("./color-kit").ColorKit} */
export function createColorKit() {
  var DEFAULT_HEX = "#0078d4";
  var PRESETS = [
    { id: "default", label: "Blue (Default)", hex: "#0078d4" },
    { id: "purple", label: "Purple", hex: "#8b5cf6" },
    { id: "pink", label: "Pink", hex: "#ec4899" },
    { id: "red", label: "Red", hex: "#ef4444" },
    { id: "orange", label: "Orange", hex: "#f97316" },
    { id: "amber", label: "Amber", hex: "#d97706" },
    { id: "green", label: "Green", hex: "#10b981" },
    { id: "teal", label: "Teal", hex: "#06b6d4" },
    { id: "slate", label: "Slate", hex: "#64748b" },
    { id: "green-yuri", label: "GreenYuri", hex: "#b1fe00" },
  ];
  var PRESET_HEX = {};
  for (var i = 0; i < PRESETS.length; i++) PRESET_HEX[PRESETS[i].id] = PRESETS[i].hex;

  function resolveHex(color) {
    if (!color || color === "default") return DEFAULT_HEX;
    var norm = String(color).trim().toLowerCase();
    if (PRESET_HEX[norm]) return PRESET_HEX[norm];
    var clean = norm.replace("#", "");
    if (/^([0-9a-f]{3}|[0-9a-f]{6})$/.test(clean)) {
      if (clean.length === 3) clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
      return "#" + clean;
    }
    return DEFAULT_HEX;
  }
  function parseHex(color) {
    var num = parseInt(resolveHex(color).slice(1), 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  function toHex(r, g, b) {
    var c = function (v) { return Math.max(0, Math.min(255, Math.round(v))); };
    var h = ((c(r) << 16) | (c(g) << 8) | c(b)).toString(16);
    return "#" + "000000".slice(h.length) + h;
  }
  /** Mix towards white (percent > 0) or black (percent < 0). */
  function adjust(hex, percent) {
    var f = percent / 100;
    var rgb = parseHex(hex);
    if (f >= 0) return toHex(rgb[0] + (255 - rgb[0]) * f, rgb[1] + (255 - rgb[1]) * f, rgb[2] + (255 - rgb[2]) * f);
    var m = 1 + f;
    return toHex(rgb[0] * m, rgb[1] * m, rgb[2] * m);
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return [h * 360, s, l];
  }
  function hslToRgb(h, s, l) {
    h = (h % 360) / 360;
    if (h < 0) h += 1;
    if (s === 0) return [Math.round(l * 255), Math.round(l * 255), Math.round(l * 255)];
    var hue2rgb = function (p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    return [Math.round(hue2rgb(p, q, h + 1 / 3) * 255), Math.round(hue2rgb(p, q, h) * 255), Math.round(hue2rgb(p, q, h - 1 / 3) * 255)];
  }
  /** Black or white, whichever reads on top of `hex` (YIQ). */
  function contrastText(hex) {
    var rgb = parseHex(hex);
    return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000 >= 125 ? "#000000" : "#ffffff";
  }
  /** A very dark shade of the accent hue, for text on pale accent tints. */
  function deepText(hex, targetL, maxS) {
    if (targetL === undefined) targetL = 0.14;
    if (maxS === undefined) maxS = 0.75;
    var rgb = parseHex(hex);
    var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    var yellowGreen = hsl[0] >= 45 && hsl[0] <= 95;
    var out = hslToRgb(hsl[0], Math.min(hsl[1], maxS), yellowGreen ? Math.min(targetL, 0.11) : targetL);
    return toHex(out[0], out[1], out[2]);
  }
  /** The accent hue at a lightness that passes contrast as link text on the theme's surface. */
  function linkColor(hex, dark) {
    var rgb = parseHex(hex);
    var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    var h = hsl[0], s = hsl[1], l, out;
    if (dark) {
      l = h >= 45 && h <= 95 ? 0.6 : 0.7;
      out = hslToRgb(h, Math.max(0.65, Math.min(s, 0.9)), l);
      return toHex(out[0], out[1], out[2]);
    }
    if (h >= 45 && h <= 95) l = 0.22;
    else if (h > 95 && h < 190) l = 0.28;
    else if (h >= 190 && h <= 250) l = 0.36;
    else l = 0.34;
    out = hslToRgb(h, Math.max(0.6, Math.min(s, 0.95)), l);
    return toHex(out[0], out[1], out[2]);
  }

  /**
   * Every CSS custom property the accent drives, for one theme family.
   * family: "light" | "dark" | "high-contrast" | "windows7".
   */
  function accentPalette(color, family) {
    var hex = resolveHex(color);
    var a = function (p) { return adjust(hex, p); };
    var dark = family === "dark", hc = family === "high-contrast", w7 = family === "windows7";
    var onDark = dark || hc;
    var contrast = contrastText(hex);
    var link = linkColor(hex, onDark);

    var primary = hex, primaryHover = a(10), primaryActive = a(-12), primaryBorder = a(-22);
    var borderFocus = hex, buttonHover = a(90), buttonActive = a(78);
    var linkHover = onDark ? adjust(link, 15) : adjust(link, -15);
    if (dark) {
      primary = a(18); primaryHover = a(28); primaryActive = a(5); primaryBorder = a(-15);
      borderFocus = a(22); buttonHover = a(-72); buttonActive = a(-55); link = a(18); linkHover = a(32);
    } else if (hc) {
      primary = a(25); primaryHover = a(38); primaryActive = a(10); primaryBorder = a(-10);
      borderFocus = a(30); buttonHover = a(-60); buttonActive = a(-45); link = a(25); linkHover = a(40);
    } else if (w7) {
      primary = a(-5); primaryHover = a(14); primaryActive = a(-18); primaryBorder = a(-25); borderFocus = a(10);
    }

    var activeText = deepText(hex, 0.14, 0.75);
    var lightTopbar = contrast === "#000000";
    return {
      "--sys-accent": hex,
      "--sys-primary": primary,
      "--sys-primary-border": primaryBorder,
      "--sys-primary-hover": primaryHover,
      "--sys-primary-active": primaryActive,
      "--sys-highlight-bg": hex,
      "--sys-highlight-text": contrast,
      "--sys-border-focus": borderFocus,
      "--sys-button-hover": buttonHover,
      "--sys-button-active": buttonActive,
      "--sys-button-primary-bg": hex,
      "--sys-button-primary-border": w7 ? primaryBorder : a(-15),
      "--sys-button-primary-hover": onDark ? a(10) : a(-8),
      "--sys-button-primary-active": onDark ? a(-10) : a(-15),
      "--sys-link": link,
      "--sys-link-hover": linkHover,
      // Aero colourisation (used by the windows7 theme and any app chrome that wants accent tints)
      "--ds-accent-aero-light": a(25),
      "--ds-accent-aero-mid": hex,
      "--ds-accent-aero-dark": linkColor(hex, false),
      "--ds-accent-aero-border": a(-32),
      "--ds-accent-active-grad-1": a(90),
      "--ds-accent-active-grad-2": a(77),
      "--ds-accent-active-grad-3": a(60),
      "--ds-accent-active-grad-4": a(41),
      "--ds-accent-active-border": a(-25),
      "--ds-accent-active-text": activeText,
      "--ds-accent-hover-grad-1": a(92),
      "--ds-accent-hover-grad-2": a(76),
      "--ds-accent-hover-grad-3": a(66),
      "--ds-accent-hover-border": a(8),
      "--ds-accent-subtab-grad-1": a(85),
      "--ds-accent-subtab-grad-2": a(72),
      "--ds-accent-subtab-grad-3": a(56),
      "--ds-accent-subtab-grad-4": a(78),
      "--ds-accent-subtab-border": a(-25),
      "--ds-accent-subtab-text": activeText,
      "--ds-accent-badge-bg": a(68),
      "--ds-accent-badge-border": a(38),
      "--ds-accent-badge-text": deepText(hex, 0.16, 0.7),
      "--ds-accent-box-bg-1": "#ffffff",
      "--ds-accent-box-bg-2": a(75),
      "--ds-accent-box-border": a(40),
      "--ds-accent-divider": a(45),
      "--ds-accent-wall-1": a(60),
      "--ds-accent-wall-2": a(42),
      "--ds-accent-wall-3": a(25),
      "--ds-accent-topbar-1": a(32),
      "--ds-accent-topbar-2": a(18),
      "--ds-accent-topbar-3": hex,
      "--ds-accent-topbar-4": a(24),
      "--ds-accent-taskbar-1": a(35),
      "--ds-accent-taskbar-2": a(20),
      "--ds-accent-topbar-text": lightTopbar ? deepText(hex, 0.12, 0.75) : "#ffffff",
      "--ds-accent-topbar-shadow": lightTopbar
        ? "0 0 8px rgba(255, 255, 255, 0.95), 0 0 3px #ffffff, 0 1px 0 #ffffff"
        : "0 1px 2px rgba(0, 0, 0, 0.65), 0 0 6px rgba(0, 0, 0, 0.35)",
    };
  }

  return {
    DEFAULT_HEX: DEFAULT_HEX,
    PRESETS: PRESETS,
    resolveHex: resolveHex,
    parseHex: parseHex,
    toHex: toHex,
    adjust: adjust,
    rgbToHsl: rgbToHsl,
    hslToRgb: hslToRgb,
    contrastText: contrastText,
    deepText: deepText,
    linkColor: linkColor,
    accentPalette: accentPalette,
  };
}
