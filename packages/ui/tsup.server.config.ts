import { browserBundlePreset } from "@o3osatoshi/config/tsup";

export default browserBundlePreset({
  bundle: true,
  entry: { index: "src/index.server.ts" },
  outDir: "dist/server",
  splitting: false,
});
