import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.server.ts" },
  outDir: "dist/server",
  format: ["esm"],
  dts: true,
  platform: "browser",
  target: "es2022",
  external: ["react", "react-dom", "next"],
  clean: false,
  treeshake: true,
  minify: false,
  bundle: true,
  splitting: false,
  sourcemap: false,
});
