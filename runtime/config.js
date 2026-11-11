// SoulWindow runtime — config.js: theme registry and option defaults shared by boot.js and soulwindow.js.

/**
 * Built-in themes. `bg` / `text` paint <html> before the CSS loads (no white flash in dark mode);
 * `meta` is the browser / Android status-bar colour.
 * @type {Record<string, import("./config").ThemeDef>}
 */
export const DEFAULT_THEMES = {
  light: { family: "light", label: "Light", meta: "#f5f5f5", bg: "#ececec", text: "#000000" },
  dark: { family: "dark", label: "Dark", meta: "#181818", bg: "#1e1e1e", text: "#e0e0e0" },
  "high-contrast": { family: "high-contrast", label: "High Contrast", meta: "#000000", bg: "#000000", text: "#ffffff" },
};

export const DENSITIES = /** @type {const} */ (["compact", "comfortable", "touch"]);

/** @param {import("./config").SoulWindowOptions} [o] @returns {import("./config").ResolvedOptions} */
export function resolveOptions(o) {
  o = o || {};
  var themes = o.themes || DEFAULT_THEMES;
  return {
    storagePrefix: o.storagePrefix == null ? "sw-" : o.storagePrefix,
    themes: themes,
    defaultTheme: o.defaultTheme && (o.defaultTheme === "system" || themes[o.defaultTheme]) ? o.defaultTheme : "system",
    density: o.density || "comfortable",
    metaId: o.metaId || "sw-theme-color-meta",
    legacyClassPrefix: o.legacyClassPrefix || null,
  };
}
