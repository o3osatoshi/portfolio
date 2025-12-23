import { publicDualBundlePreset } from "@o3osatoshi/config/tsup";

export default await publicDualBundlePreset({
  entry: {
    browser: "src/browser.ts",
    edge: "src/edge.ts",
    index: "src/index.ts",
    node: "src/node.ts",
  },
});
