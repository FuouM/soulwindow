import type { SoulWindowOptions } from "./config";

/** A tag Vite injects into index.html (structurally Vite's `HtmlTagDescriptor`). */
export interface SoulWindowHtmlTag {
  tag: string;
  attrs?: Record<string, string | boolean | undefined>;
  children?: string;
  injectTo?: "head" | "body" | "head-prepend" | "body-prepend";
}

/**
 * The plugin object, typed structurally so it is assignable to Vite's `Plugin` without this
 * package depending on Vite's types.
 */
export interface SoulWindowVitePlugin {
  name: string;
  transformIndexHtml: {
    order: "pre";
    handler: () => SoulWindowHtmlTag[];
  };
}

/** Vite plugin: injects the theme-color meta and the pre-paint boot script into index.html. */
export function soulwindow(options?: SoulWindowOptions & { injectMeta?: boolean }): SoulWindowVitePlugin;
