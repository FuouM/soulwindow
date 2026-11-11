import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { soulwindow } from "../runtime/vite.js";

export default defineConfig({
  root: __dirname,
  base: "./",
  plugins: [solid(), soulwindow({ storagePrefix: "sw-showcase-" })],
  build: { outDir: "dist", emptyOutDir: true },
});
