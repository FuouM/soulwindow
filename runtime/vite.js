// SoulWindow — Vite plugin. Injects <meta name="theme-color"> and the pre-paint boot script at the
// top of <head>, generated from the same options the app passes to createSoulWindow().
//
//   // vite.config.ts
//   import { soulwindow } from "soulwindow/vite";
//   export default defineConfig({ plugins: [soulwindow({ storagePrefix: "ds-" })] });
import { bootScript } from "./boot.js";
import { resolveOptions } from "./config.js";

/** @param {import("./config").SoulWindowOptions & { injectMeta?: boolean }} [options] */
export function soulwindow(options) {
  var cfg = resolveOptions(options);
  var injectMeta = !options || options.injectMeta !== false;
  var first = cfg.themes[Object.keys(cfg.themes)[0]];
  return {
    name: "soulwindow-boot",
    transformIndexHtml: {
      order: "pre",
      handler: function () {
        var tags = [];
        if (injectMeta) {
          tags.push({ tag: "meta", attrs: { name: "theme-color", id: cfg.metaId, content: first.meta }, injectTo: "head-prepend" });
        }
        tags.push({ tag: "script", children: bootScript(options), injectTo: "head-prepend" });
        return tags;
      },
    },
  };
}
