import tsconfigPaths from "vite-tsconfig-paths";

import { browserTestPreset } from "@o3osatoshi/config/vitest";

export default browserTestPreset({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      exclude: [
        "scripts/**",
        "**/*.stories.tsx",
        "tsup.*.config.ts",
        "index.*.ts",
        "**/index.*.ts",
      ],
    },
    setupFiles: ["./src/test/setup-tests.ts"],
  },
});
