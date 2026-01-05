import {
  browserBundlePreset,
  publicDualBundlePreset,
} from "@o3osatoshi/config/tsup";

export default [
  publicDualBundlePreset({
    entry: {
      axiom: "src/axiom.ts",
      browser: "src/browser.ts",
      edge: "src/edge.ts",
      index: "src/index.ts",
      nextjs: "src/nextjs.ts",
      node: "src/node.ts",
      proxy: "src/proxy.ts",
    },
    splitting: false,
  }),
  browserBundlePreset({
    clean: false,
    entry: {
      "nextjs-client": "src/nextjs-client.ts",
    },
    onSuccess: "node ./scripts/ensure-use-client.mjs dist/nextjs-client.js",
    splitting: false,
  }),
];
