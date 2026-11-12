// Compiles solid/ to plain ES modules (dist/esm) for consumers that do not resolve the `solid`
// export condition. One module per source file so apps tree-shake unused components.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [solid()],
  build: {
    outDir: "dist/esm",
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    target: "es2020",
    lib: {
      entry: { index: src("./solid/index.ts"), "pro/index": src("./solid/pro/index.ts") },
      formats: ["es"],
    },
    rollupOptions: {
      external: [/^solid-js(\/|$)/, /^soulwindow(\/|$)/],
      output: { preserveModules: true, preserveModulesRoot: src("./solid"), entryFileNames: "[name].js" },
    },
  },
});
