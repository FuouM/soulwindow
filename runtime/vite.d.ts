import type { SoulWindowOptions } from "./config";
/** Vite plugin: injects the theme-color meta and the pre-paint boot script into index.html. */
export function soulwindow(options?: SoulWindowOptions & { injectMeta?: boolean }): {
  name: string;
  transformIndexHtml: unknown;
};
