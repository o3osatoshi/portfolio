import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.client.ts" },
  outDir: "dist/client",
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
  onSuccess: "node ./scripts/ensure-use-client.mjs dist/client/index.js",
});
