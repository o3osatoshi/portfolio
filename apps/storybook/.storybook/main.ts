import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
  addons: [
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-coverage"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-vitest"),
  ],

  core: {},

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  staticDirs: ["../public"],
  stories: ["../../../packages/ui/src/**/*.stories.@(ts|tsx|js|jsx|mdx)"],

  async viteFinal(baseConfig) {
    // customize the Vite config here
    return {
      ...baseConfig,
      build: {
        ...(baseConfig.build ?? {}),
        chunkSizeWarningLimit: 1500,
      },
      define: { "process.env": {} },
      resolve: {
        alias: [
          {
            find: "ui",
            replacement: resolve(__dirname, "../../../packages/ui/"),
          },
        ],
      },
    };
  },
};

export default config;
