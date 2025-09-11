import { browserPreset } from "@o3osatoshi/config/tsup";

export default await browserPreset({
  bundle: true,
  clean: false,
  dts: true,
  entry: { index: "src/index.client.ts" },
  onSuccess: "node ./scripts/ensure-use-client.mjs dist/client/index.js",
  outDir: "dist/client",
  splitting: false,
});
