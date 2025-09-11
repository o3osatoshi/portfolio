import { browserPreset } from "@o3osatoshi/config/tsup";

export default await browserPreset({
  bundle: true,
  clean: false,
  dts: true,
  entry: { index: "src/index.server.ts" },
  outDir: "dist/server",
  splitting: false,
});
