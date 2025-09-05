import { browserPreset } from "@o3osatoshi/config/tsup";

export default await browserPreset({ index: "src/index.ts" }, { dts: true });
