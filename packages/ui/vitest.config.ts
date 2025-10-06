import tsconfigPaths from "vite-tsconfig-paths";

import { browserTestPreset } from "@o3osatoshi/config/vitest";

export default browserTestPreset({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      exclude: ["**/*.stories.tsx", "tsup.*.config.ts"],
    },
    setupFiles: ["./src/test/setup-tests.ts"],
  },
});
