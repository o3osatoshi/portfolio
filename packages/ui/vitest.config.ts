import tsconfigPaths from "vite-tsconfig-paths";

import { browserTestPreset } from "@o3osatoshi/config/vitest";

export default browserTestPreset({
  plugins: [tsconfigPaths()],
});
