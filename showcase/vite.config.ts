import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { soulwindow } from "../runtime/vite.js";

export default defineConfig({
  root: __dirname,
  base: "./",
  plugins: [solid(), soulwindow({ storagePrefix: "sw-showcase-" })],
  // solid/ imports its own package ("soulwindow/runtime"); serve that from the working tree.
  resolve: { alias: { "soulwindow/runtime": `${__dirname}/../runtime/index.js` } },
  build: { outDir: "dist", emptyOutDir: true },
});
