import { publicDualBundlePreset } from "@o3osatoshi/config/tsup";

export default await publicDualBundlePreset({
  entry: {
    axiom: "src/axiom.ts",
    browser: "src/browser.ts",
    edge: "src/edge.ts",
    index: "src/index.ts",
    nextjs: "src/nextjs.ts",
    "nextjs-client": "src/nextjs-client.ts",
    node: "src/node.ts",
  },
});
