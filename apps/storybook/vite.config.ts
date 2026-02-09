/// <reference types="vitest/config" />
import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

import { storybookTestPreset } from "@o3osatoshi/config/vitest";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default storybookTestPreset({
  plugins: [tailwindcss(), react(), tsconfigPaths()],
  test: {
    coverage: {
      exclude: [".storybook/**", "vite.config.ts"],
    },
    // Storybook browser tests can occasionally fail to dynamically import stories
    // under heavy CI load. Running files serially improves stability.
    fileParallelism: false,
    maxWorkers: 1,
    projects: [
      {
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
    testTimeout: 15000,
  },
});
