import { browserPreset } from "@o3osatoshi/config/tsup";

export default await browserPreset({
  entry: { index: "src/index.client.ts" },
  outDir: "dist/client",
  dts: true,
  clean: false,
  bundle: true,
  splitting: false,
  onSuccess: "node ./scripts/ensure-use-client.mjs dist/client/index.js",
});
