import { publicDualBundlePreset } from "@o3osatoshi/config/tsup";

export default publicDualBundlePreset({
  entry: {
    bin: "src/bin.ts",
    index: "src/index.ts",
  },
  splitting: false,
});
