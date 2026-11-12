// Compile-time check (npm run typecheck): the plugin must be assignable to Vite's Plugin, so
// apps can list it in `plugins` without a cast.
import type { Plugin, PluginOption } from "vite";
import { soulwindow } from "../runtime/vite.js";

export const plugin: Plugin = soulwindow({ storagePrefix: "test-" });
export const option: PluginOption = soulwindow();
