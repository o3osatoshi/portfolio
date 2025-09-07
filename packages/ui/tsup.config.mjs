import { browserPreset } from "@o3osatoshi/config/tsup";

export default await browserPreset({ entry: "src/index.ts" }, { dts: true });
