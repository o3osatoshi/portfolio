import { browserBundlePreset } from "@o3osatoshi/config/tsup";

export default await browserBundlePreset({
  bundle: true,
  entry: { index: "src/index.client.ts" },
  onSuccess: "node ./scripts/ensure-use-client.mjs dist/client/index.js",
  outDir: "dist/client",
  splitting: false,
});
