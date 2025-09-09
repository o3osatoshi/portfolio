import { browserPreset } from "@o3osatoshi/config/tsup";

export default await browserPreset({
  entry: { index: "src/index.server.ts" },
  outDir: "dist/server",
  dts: true,
  clean: false,
  bundle: true,
  splitting: false,
});
