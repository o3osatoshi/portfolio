import { defineConfig } from "tsup";

export default defineConfig([
  // tsup preset
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
  // vitest base config
  {
    entry: { base: "src/vitest/base.ts" },
    format: ["esm"],
    dts: false,
    sourcemap: false,
    clean: false,
    treeshake: true,
    minify: false,
    splitting: false,
    target: "es2022",
    platform: "node",
    outDir: "dist/vitest",
  },
]);
