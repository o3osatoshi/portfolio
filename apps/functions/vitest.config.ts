import tsconfigPaths from "vite-tsconfig-paths";

import { baseTestPreset } from "@o3osatoshi/config/vitest";

export default baseTestPreset({
  plugins: [tsconfigPaths()],
});
