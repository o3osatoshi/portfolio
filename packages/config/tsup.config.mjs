import { defineConfig } from "tsup";

// Note: Do not import presets from this package to build itself.
// Use a plain tsup config to avoid circular dependency during bootstrapping.
export default defineConfig({
  entry: { index: "src/tsup/index.ts" },
  format: ["esm"],
  dts: true,
  target: "es2022",
  platform: "node",
  splitting: false,
  sourcemap: false,
  minify: false,
  clean: true,
  treeshake: true,
  outDir: "dist/tsup",
});
