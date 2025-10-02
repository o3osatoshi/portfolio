import { defineConfig } from "tsup";

// Note: Do not import presets from this package to build itself.
// Use a plain tsup config to avoid circular dependency during bootstrapping.
export default defineConfig({
  clean: true,
  dts: true,
  entry: { index: "src/index.ts" },
  format: ["esm"],
  minify: false,
  platform: "node",
  sourcemap: false,
  splitting: true,
  target: "es2022",
  treeshake: true,
});
