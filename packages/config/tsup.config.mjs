import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/tsup/index.ts" },
    format: ["esm"],
    dts: true,
    sourcemap: false,
    clean: true,
    treeshake: true,
    minify: false,
    splitting: false,
    target: "es2022",
    platform: "node",
    outDir: "dist/tsup",
  },
]);
